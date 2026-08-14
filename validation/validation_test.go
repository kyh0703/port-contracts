package validation

import (
	"strings"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const publicationContractRevision = "execution-publication-2026-08-14-r1"

func TestValidateRejectsMissingRequiredFields(t *testing.T) {
	if err := Validate(&apiv1.RecordGatewayEventRequest{}); err == nil {
		t.Fatal("Validate() error = nil, want validation error")
	}
}

func TestValidateAcceptsValidGatewayEvent(t *testing.T) {
	err := Validate(&apiv1.RecordGatewayEventRequest{
		EventType:      apiv1.GatewayLifecycleEventType_GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED,
		ConversationId: "conversation-1",
		OccurredAt:     timestamppb.Now(),
	})
	if err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}

func TestExecutionSessionServiceExposesOnlyPublishedBootstrap(t *testing.T) {
	descriptor, err := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.ExecutionSessionService")
	if err != nil {
		t.Fatal(err)
	}
	service := descriptor.(protoreflect.ServiceDescriptor)
	if service.Methods().Len() != 1 {
		t.Fatalf("ExecutionSessionService method count = %d, want 1", service.Methods().Len())
	}
	method := service.Methods().ByName("BootstrapPublished")
	if method == nil {
		t.Fatal("BootstrapPublished method is missing")
	}
	if method.Input().FullName() != "port.api.v1.BootstrapPublishedRequest" {
		t.Fatalf("BootstrapPublished input = %s", method.Input().FullName())
	}
	if method.Output().FullName() != "port.api.v1.BootstrapPublishedResponse" {
		t.Fatalf("BootstrapPublished output = %s", method.Output().FullName())
	}
	for _, legacy := range []protoreflect.Name{
		"Bootstrap",
		"BootstrapSip",
		"BootstrapAgent",
		"BootstrapOrchestration",
	} {
		if service.Methods().ByName(legacy) != nil {
			t.Fatalf("legacy method %s remains exposed", legacy)
		}
	}
}

func TestPublishedBootstrapRequestValidation(t *testing.T) {
	valid := validPublishedRequest()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid request) = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*apiv1.BootstrapPublishedRequest)
	}{
		{"missing admission", func(request *apiv1.BootstrapPublishedRequest) { request.Admission = nil }},
		{"empty admission", func(request *apiv1.BootstrapPublishedRequest) { request.Admission = &apiv1.BootstrapRequest{} }},
		{"missing conversation", func(request *apiv1.BootstrapPublishedRequest) { request.ConversationId = "" }},
		{"missing session", func(request *apiv1.BootstrapPublishedRequest) { request.SessionId = "" }},
		{"missing publication", func(request *apiv1.BootstrapPublishedRequest) { request.PublishedId = "" }},
		{"wrong revision", func(request *apiv1.BootstrapPublishedRequest) { request.ContractRevision = "legacy" }},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := proto.Clone(valid).(*apiv1.BootstrapPublishedRequest)
			tt.mutate(request)
			if err := Validate(request); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestPublishedDirectTextResponseValidation(t *testing.T) {
	valid := validDirectTextResponse()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid direct text response) = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*apiv1.BootstrapPublishedResponse)
	}{
		{"wrong revision", func(response *apiv1.BootstrapPublishedResponse) { response.ContractRevision = "legacy" }},
		{"missing execution", func(response *apiv1.BootstrapPublishedResponse) { response.Execution = nil }},
		{"missing runtime", func(response *apiv1.BootstrapPublishedResponse) { response.Runtime = nil }},
		{"missing prompt agent runtime", func(response *apiv1.BootstrapPublishedResponse) { response.GetPromptAgent().Runtime = nil }},
		{"wrong text transport", func(response *apiv1.BootstrapPublishedResponse) { response.GetTextRuntime().Transport = "audio" }},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := proto.Clone(valid).(*apiv1.BootstrapPublishedResponse)
			tt.mutate(response)
			if err := Validate(response); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestPublishedVoiceRuntimeRequiresAllComponents(t *testing.T) {
	valid := validDirectVoiceResponse()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid direct voice response) = %v", err)
	}

	for _, name := range []string{"stt", "tts", "background_audio", "dtmf", "transport", "vad", "speech_policy", "limits"} {
		t.Run(name, func(t *testing.T) {
			response := proto.Clone(valid).(*apiv1.BootstrapPublishedResponse)
			runtime := response.GetVoiceRuntime()
			switch name {
			case "stt":
				runtime.Stt = nil
			case "tts":
				runtime.Tts = nil
			case "background_audio":
				runtime.BackgroundAudio = nil
			case "dtmf":
				runtime.Dtmf = nil
			case "transport":
				runtime.Transport = nil
			case "vad":
				runtime.Vad = nil
			case "speech_policy":
				runtime.SpeechPolicy = nil
			case "limits":
				runtime.Limits = nil
			}
			if err := Validate(response); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestConversationFillerRuntimeValidation(t *testing.T) {
	tests := []struct {
		name   string
		phrase string
		valid  bool
	}{
		{name: "absent", valid: true},
		{name: "configured", phrase: "One moment while I look that up.", valid: true},
		{name: "empty", phrase: "", valid: false},
		{name: "over max length", phrase: strings.Repeat("a", 201), valid: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			runtime := validCallRuntime()
			if tt.name != "absent" {
				runtime.ConversationFiller = &apiv1.ConversationFillerRuntime{Phrase: tt.phrase}
			}
			err := Validate(runtime)
			if tt.valid && err != nil {
				t.Fatalf("Validate() error = %v, want nil", err)
			}
			if !tt.valid && err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestPublishedOrchestrationValidation(t *testing.T) {
	for _, valid := range []*apiv1.BootstrapPublishedResponse{
		validSupervisorTextResponse(),
		validHandoffTextResponse(),
	} {
		if err := Validate(valid); err != nil {
			t.Fatalf("Validate(valid orchestration) = %v", err)
		}
	}

	supervisor := validSupervisorTextResponse()
	supervisor.GetOrchestration().Mode = apiv1.OrchestrationMode_ORCHESTRATION_MODE_HANDOFF
	if err := Validate(supervisor); err == nil {
		t.Fatal("Validate(mode/snapshot mismatch) = nil")
	}

	handoff := validHandoffTextResponse()
	handoff.GetOrchestration().Handoff.MaxHandoffDepth = 0
	if err := Validate(handoff); err == nil {
		t.Fatal("Validate(zero handoff depth) = nil")
	}
}

func TestPublishedBootstrapWireRoundTrip(t *testing.T) {
	for _, source := range []proto.Message{
		validPublishedRequest(),
		validDirectTextResponse(),
		validDirectVoiceResponse(),
		validSupervisorTextResponse(),
		validHandoffTextResponse(),
	} {
		wire, err := proto.Marshal(source)
		if err != nil {
			t.Fatalf("proto.Marshal(%T) = %v", source, err)
		}
		decoded := source.ProtoReflect().New().Interface()
		if err := proto.Unmarshal(wire, decoded); err != nil {
			t.Fatalf("proto.Unmarshal(%T) = %v", source, err)
		}
		if !proto.Equal(decoded, source) {
			t.Fatalf("wire round-trip changed %T", source)
		}
	}
}

func validPublishedRequest() *apiv1.BootstrapPublishedRequest {
	return &apiv1.BootstrapPublishedRequest{
		Admission: &apiv1.BootstrapRequest{
			Admission: &apiv1.BootstrapRequest_WebrtcTicket{WebrtcTicket: "ticket-1"},
		},
		ConversationId:   "conversation-1",
		SessionId:        "session-1",
		PublishedId:      "publication-1",
		ContractRevision: publicationContractRevision,
	}
}

func validPromptAgentRuntime(id string) *apiv1.PublishedPromptAgentRuntime {
	return &apiv1.PublishedPromptAgentRuntime{
		PromptAgentPublishedId: id,
		LlmWorker:              &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Instructions:           &apiv1.PromptInstructions{SystemPrompt: "Help."},
		ContextPolicy:          apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
	}
}

func validInlineRuntime(id string) *apiv1.PublishedInlinePromptRuntime {
	return &apiv1.PublishedInlinePromptRuntime{
		NodeId:        id,
		LlmWorker:     &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Instructions:  &apiv1.InlinePromptInstructions{SystemPrompt: "Help."},
		ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
	}
}

func validTextRuntime() *apiv1.TextRuntimeSnapshot {
	return &apiv1.TextRuntimeSnapshot{
		Transport:                 "text_stream",
		RoomName:                  "room-1",
		ParticipantIdentity:       "participant-1",
		IdleTimeoutSeconds:        300,
		MaxSessionDurationSeconds: 3600,
	}
}

func validCallRuntime() *apiv1.CallRuntimeSnapshot {
	return &apiv1.CallRuntimeSnapshot{
		Stt: &apiv1.SttRuntime{ApiKey: "stt-key", Model: "stt-model", Language: "ko"},
		Tts: &apiv1.TtsRuntime{ApiKey: "tts-key", Model: "tts-model", Language: "ko", VoiceId: "voice-1"},
		BackgroundAudio: &apiv1.BackgroundAudioRuntime{
			Preset: apiv1.BackgroundAudioPreset_BACKGROUND_AUDIO_PRESET_NONE,
			Volume: proto.Float64(0.5),
		},
		Dtmf:         &apiv1.DtmfInputRuntime{TimeoutSeconds: 3},
		Transport:    &apiv1.TransportRuntime{Source: apiv1.CallTransportSource_CALL_TRANSPORT_SOURCE_WEBRTC, RoomName: "room-1", CallerParticipantIdentity: "caller-1"},
		Vad:          &apiv1.VadRuntime{NoiseCancellation: apiv1.NoiseCancellationMode_NOISE_CANCELLATION_MODE_STANDARD, RecognitionSensitivity: proto.Float64(0.5)},
		SpeechPolicy: &apiv1.SpeechPolicyRuntime{ResponseSpeed: proto.Float64(0.5), AllowInterruptions: proto.Bool(true)},
		Limits:       &apiv1.CallLimitsRuntime{DialWaitTimeSeconds: 30, MaxCallDurationSeconds: 600, NoAnswerTimeoutSeconds: 30},
	}
}

func basePublishedResponse() *apiv1.BootstrapPublishedResponse {
	return &apiv1.BootstrapPublishedResponse{
		ContractRevision: publicationContractRevision,
		ConversationId:   "conversation-1",
		SessionId:        "session-1",
		PublishedId:      "publication-1",
	}
}

func validDirectTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Execution = &apiv1.BootstrapPublishedResponse_PromptAgent{
		PromptAgent: &apiv1.PublishedPromptAgentExecution{Runtime: validPromptAgentRuntime("prompt-agent-publication-1")},
	}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}

func validDirectVoiceResponse() *apiv1.BootstrapPublishedResponse {
	response := validDirectTextResponse()
	response.Runtime = &apiv1.BootstrapPublishedResponse_VoiceRuntime{VoiceRuntime: validCallRuntime()}
	return response
}

func validSupervisorTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Execution = &apiv1.BootstrapPublishedResponse_Orchestration{
		Orchestration: &apiv1.PublishedOrchestrationExecution{
			Mode:         apiv1.OrchestrationMode_ORCHESTRATION_MODE_SUPERVISOR,
			NodeRuntimes: []*apiv1.PublishedInlinePromptRuntime{validInlineRuntime("supervisor-node"), validInlineRuntime("specialist-node")},
			Supervisor: &apiv1.PublishedSupervisorSnapshot{
				SupervisorNodeId: "supervisor-node",
				Specialists: []*apiv1.PublishedSupervisorSpecialist{{
					RelationId:       "billing",
					TargetNodeId:     "specialist-node",
					RouteDescription: "Handle billing",
					ContextPolicy:    apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
				}},
			},
		},
	}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}

func validHandoffTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Execution = &apiv1.BootstrapPublishedResponse_Orchestration{
		Orchestration: &apiv1.PublishedOrchestrationExecution{
			Mode:         apiv1.OrchestrationMode_ORCHESTRATION_MODE_HANDOFF,
			NodeRuntimes: []*apiv1.PublishedInlinePromptRuntime{validInlineRuntime("entry-node"), validInlineRuntime("target-node")},
			Handoff: &apiv1.PublishedHandoffSnapshot{
				EntryNodeId:      "entry-node",
				MaxHandoffDepth: 2,
				Routes: []*apiv1.PublishedHandoffRoute{{
					TransitionId:       "billing",
					SourceNodeId:       "entry-node",
					TargetNodeId:       "target-node",
					RoutingDescription: "Handle billing",
					ContextPolicy:      apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
				}},
			},
		},
	}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}
