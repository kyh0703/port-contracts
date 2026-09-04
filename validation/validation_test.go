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

const publicationContractRevision = "execution-publication-2026-09-03-r1"

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

func TestKnowledgeToolMetadataValidation(t *testing.T) {
	valid := &apiv1.NodeToolMetadata{
		ToolId: "knowledge-search",
		Kind:   "knowledge",
		Name:   "Search",
		Metadata: &apiv1.NodeToolMetadata_Knowledge{Knowledge: &apiv1.KnowledgeToolMetadata{
			KnowledgeRevisionId: "revision-1",
		}},
	}
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid knowledge metadata) = %v, want nil", err)
	}

	for _, tt := range []struct {
		name string
		msg  *apiv1.NodeToolMetadata
	}{
		{name: "knowledge kind missing metadata", msg: &apiv1.NodeToolMetadata{ToolId: "knowledge-search", Kind: "knowledge", Name: "Search"}},
		{name: "non-knowledge kind with knowledge metadata", msg: &apiv1.NodeToolMetadata{
			ToolId: "api-search", Kind: "api", Name: "Search",
			Metadata: &apiv1.NodeToolMetadata_Knowledge{Knowledge: &apiv1.KnowledgeToolMetadata{KnowledgeRevisionId: "revision-1"}},
		}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if err := Validate(tt.msg); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestBuiltInToolValidation(t *testing.T) {
	valid := []*apiv1.BuiltInTool{
		{Config: &apiv1.BuiltInTool_Dtmf{Dtmf: &apiv1.DtmfTool{}}},
		{Config: &apiv1.BuiltInTool_SendSms{SendSms: &apiv1.SendSmsTool{
			Recipient: "{{caller_number}}",
			Template:  "안내 메시지",
			MaxSends:  3,
		}}},
	}
	for _, tool := range valid {
		if err := Validate(tool); err != nil {
			t.Fatalf("Validate(valid built-in tool) = %v, want nil", err)
		}
	}

	for _, tt := range []struct {
		name string
		msg  *apiv1.BuiltInTool
	}{
		{name: "missing config", msg: &apiv1.BuiltInTool{}},
		{name: "sms max sends below minimum", msg: &apiv1.BuiltInTool{Config: &apiv1.BuiltInTool_SendSms{SendSms: &apiv1.SendSmsTool{Recipient: "{{caller_number}}", Template: "안내", MaxSends: 0}}}},
		{name: "sms max sends above maximum", msg: &apiv1.BuiltInTool{Config: &apiv1.BuiltInTool_SendSms{SendSms: &apiv1.SendSmsTool{Recipient: "{{caller_number}}", Template: "안내", MaxSends: 6}}}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if err := Validate(tt.msg); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
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
		{"previous exact revision", func(request *apiv1.BootstrapPublishedRequest) { request.ContractRevision = "execution-publication-2026-08-27-r1" }},
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

func TestSipCallerPhoneNumberValidation(t *testing.T) {
	for _, tt := range []struct {
		name  string
		phone *string
		valid bool
	}{
		{name: "absent", valid: true},
		{name: "present", phone: proto.String("+821012345678"), valid: true},
		{name: "anonymous", phone: proto.String("anonymous"), valid: true},
		{name: "present empty", phone: proto.String(""), valid: false},
	} {
		t.Run(tt.name, func(t *testing.T) {
			request := validSipPublishedRequest()
			request.GetAdmission().GetSip().PhoneNumber = tt.phone
			err := Validate(request)
			if tt.valid && err != nil {
				t.Fatalf("Validate() error = %v, want nil", err)
			}
			if !tt.valid && err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func validSipPublishedRequest() *apiv1.BootstrapPublishedRequest {
	request := validPublishedRequest()
	request.Admission = &apiv1.BootstrapRequest{
		Admission: &apiv1.BootstrapRequest_Sip{Sip: &apiv1.SipBootstrapContext{
			JobId:               "job-1",
			DispatchId:          "dispatch-1",
			RoomName:            "room-1",
			ParticipantIdentity: "participant-1",
			TrunkId:             "trunk-1",
			TrunkPhoneNumber:    "+821012300000",
			CallIdFull:          "call-1",
		}},
	}
	return request
}

func TestPublishedAgentTextResponseValidation(t *testing.T) {
	valid := validAgentTextResponse()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid agent text response) = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*apiv1.BootstrapPublishedResponse)
	}{
		{"old revision", func(response *apiv1.BootstrapPublishedResponse) { response.ContractRevision = "execution-publication-2026-08-27-r1" }},
		{"missing execution", func(response *apiv1.BootstrapPublishedResponse) { response.Agent = nil }},
		{"missing runtime", func(response *apiv1.BootstrapPublishedResponse) { response.Runtime = nil }},
		{"missing agent node runtime", func(response *apiv1.BootstrapPublishedResponse) { response.GetAgent().NodeRuntimes[0] = nil }},
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
	valid := validAgentVoiceResponse()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid agent voice response) = %v", err)
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

func TestConversationControlRuntimeValidation(t *testing.T) {
	valid := validCallRuntime()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid conversation control) = %v, want nil", err)
	}

	tests := []struct {
		name   string
		mutate func(*apiv1.CallRuntimeSnapshot)
	}{
		{"missing control", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.ConversationControl = nil }},
		{"empty end call message", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetConversationControl().EndCallMessage = proto.String("") }},
		{"short end call phrase", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetConversationControl().EndCallPhrases = []string{"a"} }},
		{"long elapsed say", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetConversationControl().TimeElapsedActions[0].Action = &apiv1.TimeElapsedActionRuntime_Say{Say: strings.Repeat("a", 1001)} }},
		{"missing elapsed action", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetConversationControl().TimeElapsedActions[0].Action = nil }},
		{"elapsed time out of range", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetConversationControl().TimeElapsedActions[0].AtSeconds = 3601 }},
		{"max duration below new minimum", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetLimits().MaxCallDurationSeconds = 9 }},
		{"silence timeout below new minimum", func(runtime *apiv1.CallRuntimeSnapshot) { runtime.GetLimits().NoAnswerTimeoutSeconds = 4 }},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			runtime := proto.Clone(valid).(*apiv1.CallRuntimeSnapshot)
			tt.mutate(runtime)
			if err := Validate(runtime); err == nil {
				t.Fatal("Validate() = nil, want rejection")
			}
		})
	}
}

func TestPublishedAgentValidation(t *testing.T) {
	for _, valid := range []*apiv1.BootstrapPublishedResponse{
		validSupervisorTextResponse(),
		validHandoffTextResponse(),
	} {
		if err := Validate(valid); err != nil {
			t.Fatalf("Validate(valid agent) = %v", err)
		}
	}

	supervisor := validSupervisorTextResponse()
	supervisor.GetAgent().Mode = apiv1.AgentMode_AGENT_MODE_HANDOFF
	if err := Validate(supervisor); err == nil {
		t.Fatal("Validate(mode/snapshot mismatch) = nil")
	}

	handoff := validHandoffTextResponse()
	handoff.GetAgent().Handoff.MaxHandoffDepth = 0
	if err := Validate(handoff); err == nil {
		t.Fatal("Validate(zero handoff depth) = nil")
	}

	t.Run("handoff rejects conversation context policy", func(t *testing.T) {
		handoff := validHandoffTextResponse()
		handoff.GetAgent().GetHandoff().Routes[0].ContextPolicy = apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION
		if err := Validate(handoff); err == nil {
			t.Fatal("Validate(handoff conversation context policy) = nil")
		}
	})

	t.Run("duplicate handoff parameter names", func(t *testing.T) {
		handoff := validHandoffTextResponse()
		handoff.GetAgent().GetHandoff().Routes[0].Parameters = []*apiv1.HandoffParameter{
			{Name: "reason", Type: apiv1.HandoffParameterType_HANDOFF_PARAMETER_TYPE_STRING},
			{Name: "reason", Type: apiv1.HandoffParameterType_HANDOFF_PARAMETER_TYPE_STRING},
		}
		if err := Validate(handoff); err == nil {
			t.Fatal("Validate(duplicate handoff parameter names) = nil")
		}
	})

	t.Run("handoff parameter enum values must match type", func(t *testing.T) {
		handoff := validHandoffTextResponse()
		handoff.GetAgent().GetHandoff().Routes[0].Parameters = []*apiv1.HandoffParameter{{
			Name:       "reason",
			Type:       apiv1.HandoffParameterType_HANDOFF_PARAMETER_TYPE_STRING,
			NumberEnum: []float64{10.5},
		}}
		if err := Validate(handoff); err == nil {
			t.Fatal("Validate(handoff parameter enum type mismatch) = nil")
		}
	})

	t.Run("handoff rejects both announcement and request start", func(t *testing.T) {
		handoff := validHandoffTextResponse()
		handoff.GetAgent().GetHandoff().Routes[0].Announcement = "Legacy announcement."
		if err := Validate(handoff); err == nil {
			t.Fatal("Validate(handoff legacy and canonical start message) = nil")
		}
	})

	t.Run("handoff accepts optional system prompt", func(t *testing.T) {
		handoff := validHandoffTextResponse()
		handoff.GetAgent().GetHandoff().Routes[0].SystemPrompt = proto.String("Continue without greeting the caller.")
		if err := Validate(handoff); err != nil {
			t.Fatalf("Validate(handoff system prompt) = %v", err)
		}
	})

	t.Run("handoff rejects present but empty or blank system prompt", func(t *testing.T) {
		for _, prompt := range []string{"", "   \t"} {
			handoff := validHandoffTextResponse()
			handoff.GetAgent().GetHandoff().Routes[0].SystemPrompt = proto.String(prompt)
			if err := Validate(handoff); err == nil {
				t.Fatalf("Validate(system prompt %q) = nil", prompt)
			}
		}
	})

	t.Run("supervisor rejects recent context policy", func(t *testing.T) {
		supervisor := validSupervisorTextResponse()
		supervisor.GetAgent().GetSupervisor().Specialists[0].ContextPolicy = apiv1.ContextPolicy_CONTEXT_POLICY_RECENT
		if err := Validate(supervisor); err == nil {
			t.Fatal("Validate(supervisor recent context policy) = nil")
		}
	})
}

func TestPublishedBootstrapWireRoundTrip(t *testing.T) {
	for _, source := range []proto.Message{
		validPublishedRequest(),
		validSipPublishedRequest(),
		validAgentTextResponse(),
		validAgentVoiceResponse(),
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

func validAgentNodeRuntime(id string) *apiv1.PublishedAgentNodeRuntime {
	return &apiv1.PublishedAgentNodeRuntime{
		NodeId:        id,
		LlmWorker:     &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Instructions:  &apiv1.AgentInstructions{SystemPrompt: "Help."},
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
		ConversationControl: &apiv1.ConversationControlRuntime{
			EndCallMessage: proto.String("상담을 종료하겠습니다."),
			EndCallPhrases: []string{"감사합니다"},
			TimeElapsedActions: []*apiv1.TimeElapsedActionRuntime{{
				AtSeconds: 300,
				Action: &apiv1.TimeElapsedActionRuntime_Say{Say: "곧 상담을 마무리하겠습니다."},
			}},
		},
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

func validAgentTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Agent = &apiv1.PublishedAgentExecution{Mode: apiv1.AgentMode_AGENT_MODE_HANDOFF, NodeRuntimes: []*apiv1.PublishedAgentNodeRuntime{validAgentNodeRuntime("node-1"), validAgentNodeRuntime("node-2")}, Handoff: &apiv1.PublishedHandoffSnapshot{EntryNodeId: "node-1", MaxHandoffDepth: 1, Routes: []*apiv1.PublishedHandoffRoute{{TransitionId: "route-1", SourceNodeId: "node-1", TargetNodeId: "node-2", RoutingDescription: "Finish", ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_RECENT}}}}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}

func validAgentVoiceResponse() *apiv1.BootstrapPublishedResponse {
	response := validAgentTextResponse()
	response.Runtime = &apiv1.BootstrapPublishedResponse_VoiceRuntime{VoiceRuntime: validCallRuntime()}
	return response
}

func validSupervisorTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Agent = &apiv1.PublishedAgentExecution{
		Mode:         apiv1.AgentMode_AGENT_MODE_SUPERVISOR,
		NodeRuntimes: []*apiv1.PublishedAgentNodeRuntime{validAgentNodeRuntime("supervisor-node"), validAgentNodeRuntime("specialist-node")},
		Supervisor: &apiv1.PublishedSupervisorSnapshot{
			SupervisorNodeId: "supervisor-node",
			Specialists: []*apiv1.PublishedSupervisorSpecialist{{
				RelationId:       "billing",
				TargetNodeId:     "specialist-node",
				RouteDescription: "Handle billing",
				ContextPolicy:    apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
			}},
		},
	}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}

func validHandoffTextResponse() *apiv1.BootstrapPublishedResponse {
	response := basePublishedResponse()
	response.Agent = &apiv1.PublishedAgentExecution{
		Mode:         apiv1.AgentMode_AGENT_MODE_HANDOFF,
		NodeRuntimes: []*apiv1.PublishedAgentNodeRuntime{validAgentNodeRuntime("entry-node"), validAgentNodeRuntime("target-node")},
		Handoff: &apiv1.PublishedHandoffSnapshot{
			EntryNodeId:     "entry-node",
			MaxHandoffDepth: 2,
			Routes: []*apiv1.PublishedHandoffRoute{{
				TransitionId:       "billing",
				SourceNodeId:       "entry-node",
				TargetNodeId:       "target-node",
				RoutingDescription: "Handle billing",
				ContextPolicy:      apiv1.ContextPolicy_CONTEXT_POLICY_RECENT,
				RequestStart:       "Connecting you to billing.",
			}},
		},
	}
	response.Runtime = &apiv1.BootstrapPublishedResponse_TextRuntime{TextRuntime: validTextRuntime()}
	return response
}
