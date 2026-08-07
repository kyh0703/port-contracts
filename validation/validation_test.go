package validation

import (
	"math"
	"reflect"
	"testing"

	validatepb "buf.build/gen/go/bufbuild/protovalidate/protocolbuffers/go/buf/validate"
	apiv1 "github.com/kyh0703/port-contracts/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/dynamicpb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func TestValidateRejectsMissingRequiredFields(t *testing.T) {
	err := Validate(&apiv1.RecordGatewayEventRequest{})
	if err == nil {
		t.Fatal("Validate() error = nil, want validation error")
	}
}

func requireR4FieldRules(t *testing.T, message protoreflect.MessageDescriptor, name protoreflect.Name) *validatepb.FieldRules {
	t.Helper()
	field := message.Fields().ByName(name)
	if field == nil {
		t.Fatalf("%s missing field %s", message.FullName(), name)
	}
	options := field.Options().(*descriptorpb.FieldOptions)
	if !proto.HasExtension(options, validatepb.E_Field) {
		t.Fatalf("%s.%s missing protovalidate field rules", message.FullName(), name)
	}
	rules, ok := proto.GetExtension(options, validatepb.E_Field).(*validatepb.FieldRules)
	if !ok {
		t.Fatalf("%s.%s protovalidate rules have unexpected type", message.FullName(), name)
	}
	return rules
}

func requireR4MessageRules(t *testing.T, message protoreflect.MessageDescriptor) *validatepb.MessageRules {
	t.Helper()
	options := message.Options().(*descriptorpb.MessageOptions)
	if !proto.HasExtension(options, validatepb.E_Message) {
		t.Fatalf("%s missing protovalidate message rules", message.FullName())
	}
	rules, ok := proto.GetExtension(options, validatepb.E_Message).(*validatepb.MessageRules)
	if !ok {
		t.Fatalf("%s protovalidate rules have unexpected type", message.FullName())
	}
	return rules
}

func TestR4TransportDescriptorsAndRequiredRuntimeValidation(t *testing.T) {
	messageNames := []protoreflect.FullName{
		"port.api.v1.BootstrapAgentRequest",
		"port.api.v1.BootstrapAgentResponse",
		"port.api.v1.BootstrapOrchestrationRequest",
		"port.api.v1.BootstrapOrchestrationResponse",
		"port.api.v1.CallRuntimeSnapshot",
		"port.api.v1.AgentRuntime",
		"port.api.v1.BackgroundAudioRuntime",
		"port.api.v1.DtmfInputRuntime",
		"port.api.v1.SupervisorSnapshot",
		"port.api.v1.HandoffSnapshot",
	}
	for _, name := range messageNames {
		descriptor, err := protoregistry.GlobalFiles.FindDescriptorByName(name)
		if err != nil {
			t.Fatalf("FindDescriptorByName(%q) error = %v; r4 descriptor is absent", name, err)
		}
		if _, ok := descriptor.(protoreflect.MessageDescriptor); !ok {
			t.Fatalf("descriptor %q is %T, want message descriptor", name, descriptor)
		}
	}
	serviceDescriptor, err := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.AgentSessionService")
	if err != nil {
		t.Fatalf("FindDescriptorByName(service) error = %v; r4 service is absent", err)
	}
	service := serviceDescriptor.(protoreflect.ServiceDescriptor)
	for _, method := range []struct {
		name, request, response protoreflect.FullName
	}{
		{"Bootstrap", "port.api.v1.BootstrapRequest", "port.api.v1.BootstrapResponse"},
		{"BootstrapAgent", "port.api.v1.BootstrapAgentRequest", "port.api.v1.BootstrapAgentResponse"},
		{"BootstrapOrchestration", "port.api.v1.BootstrapOrchestrationRequest", "port.api.v1.BootstrapOrchestrationResponse"},
	} {
		methodDescriptor := service.Methods().ByName(protoreflect.Name(method.name))
		if methodDescriptor == nil {
			t.Fatalf("service method %s is missing", method.name)
		}
		if methodDescriptor.Input().FullName() != method.request || methodDescriptor.Output().FullName() != method.response {
			t.Fatalf("service method %s has %s -> %s, want %s -> %s", method.name, methodDescriptor.Input().FullName(), methodDescriptor.Output().FullName(), method.request, method.response)
		}
	}
	for _, request := range []struct {
		name, targetField protoreflect.FullName
	}{
		{"port.api.v1.BootstrapAgentRequest", "agent_version_id"},
		{"port.api.v1.BootstrapOrchestrationRequest", "orchestration_version_id"},
	} {
		descriptor, _ := protoregistry.GlobalFiles.FindDescriptorByName(request.name)
		fields := descriptor.(protoreflect.MessageDescriptor).Fields()
		for _, fieldName := range []protoreflect.Name{"conversation_id", "session_id", protoreflect.Name(request.targetField), "contract_revision"} {
			if fields.ByName(fieldName) == nil {
				t.Fatalf("%s missing documented binding %q", request.name, fieldName)
			}
			if !requireR4FieldRules(t, descriptor.(protoreflect.MessageDescriptor), fieldName).GetRequired() {
				t.Fatalf("%s.%s must be required", request.name, fieldName)
			}
		}
	}

	for _, responseName := range []protoreflect.FullName{"port.api.v1.BootstrapAgentResponse", "port.api.v1.BootstrapOrchestrationResponse"} {
		response := protoregistry.GlobalFiles.FindDescriptorByName
		descriptor, lookupErr := response(responseName)
		if lookupErr != nil {
			t.Fatal(lookupErr)
		}
		rules := requireR4FieldRules(t, descriptor.(protoreflect.MessageDescriptor), "contract_revision")
		if !rules.GetRequired() || rules.GetString().GetConst() != "orchestration-2026-08-07-r4" {
			t.Fatalf("%s.contract_revision must be required and fixed to r4", responseName)
		}
	}
	responseDescriptor, _ := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.BootstrapAgentResponse")
	responseFields := responseDescriptor.(protoreflect.MessageDescriptor).Fields()
	for _, forbidden := range []protoreflect.Name{"agent_id", "agent_version_id"} {
		if responseFields.ByName(forbidden) != nil {
			t.Fatalf("BootstrapAgentResponse must derive identity from AgentRuntime, found duplicate %q", forbidden)
		}
	}

	agentRuntimeDescriptor, _ := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.AgentRuntime")
	for _, fieldName := range []protoreflect.Name{"llm_worker", "instructions"} {
		if !requireR4FieldRules(t, agentRuntimeDescriptor.(protoreflect.MessageDescriptor), fieldName).GetRequired() {
			t.Fatalf("AgentRuntime.%s must be required", fieldName)
		}
	}
	callRuntimeDescriptor, _ := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.CallRuntimeSnapshot")
	for _, fieldName := range []protoreflect.Name{"background_audio", "dtmf"} {
		if !requireR4FieldRules(t, callRuntimeDescriptor.(protoreflect.MessageDescriptor), fieldName).GetRequired() {
			t.Fatalf("CallRuntimeSnapshot.%s must be required", fieldName)
		}
	}

	orchestrationDescriptor, _ := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.BootstrapOrchestrationResponse")
	orchestration := orchestrationDescriptor.(protoreflect.MessageDescriptor)
	modeRules := requireR4FieldRules(t, orchestration, "mode")
	if !modeRules.GetRequired() || !modeRules.GetEnum().GetDefinedOnly() {
		t.Fatal("BootstrapOrchestrationResponse.mode must reject unspecified and unknown values")
	}
	messageRules := requireR4MessageRules(t, orchestration)
	foundModeSnapshot := false
	for _, rule := range messageRules.GetOneof() {
		if reflect.DeepEqual(rule.GetFields(), []string{"supervisor", "handoff"}) && rule.GetRequired() {
			foundModeSnapshot = true
		}
	}
	if !foundModeSnapshot {
		t.Fatal("BootstrapOrchestrationResponse must require exactly one supervisor or handoff snapshot")
	}
	foundModeConsistency := false
	for _, rule := range messageRules.GetCel() {
		if rule.GetId() == "bootstrap_orchestration_response.mode_snapshot" && rule.GetExpression() != "" {
			foundModeConsistency = true
		}
	}
	if !foundModeConsistency {
		t.Fatal("BootstrapOrchestrationResponse must validate mode/snapshot consistency")
	}
}

func TestR4AdmissionOneofRequired(t *testing.T) {
	validAdmission := &apiv1.BootstrapRequest{Admission: &apiv1.BootstrapRequest_WebrtcTicket{WebrtcTicket: "ticket"}}
	validRequests := []proto.Message{
		&apiv1.BootstrapAgentRequest{Admission: validAdmission, ConversationId: "conversation-1", SessionId: "session-1", AgentVersionId: "agent-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
		&apiv1.BootstrapOrchestrationRequest{Admission: validAdmission, ConversationId: "conversation-1", SessionId: "session-1", OrchestrationVersionId: "orchestration-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
	}
	for _, request := range validRequests {
		if err := Validate(request); err != nil {
			t.Fatalf("Validate(valid %T) = %v", request, err)
		}
	}
	for _, request := range []proto.Message{
		&apiv1.BootstrapAgentRequest{Admission: &apiv1.BootstrapRequest{}, ConversationId: "conversation-1", SessionId: "session-1", AgentVersionId: "agent-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
		&apiv1.BootstrapOrchestrationRequest{Admission: &apiv1.BootstrapRequest{}, ConversationId: "conversation-1", SessionId: "session-1", OrchestrationVersionId: "orchestration-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
	} {
		if err := Validate(request); err == nil {
			t.Fatalf("Validate(empty admission %T) = nil, want rejection", request)
		}
	}
}

func TestR4DynamicProtovalidateBoundaries(t *testing.T) {
	lookup := func(name protoreflect.FullName) protoreflect.MessageDescriptor {
		descriptor, err := protoregistry.GlobalFiles.FindDescriptorByName(name)
		if err != nil {
			t.Fatalf("descriptor %s: %v", name, err)
		}
		return descriptor.(protoreflect.MessageDescriptor)
	}
	background := lookup("port.api.v1.BackgroundAudioRuntime")
	presetField := background.Fields().ByName("preset")
	volumeField := background.Fields().ByName("volume")
	if presetField == nil || volumeField == nil {
		t.Fatal("BackgroundAudioRuntime missing preset or volume")
	}
	for _, presetName := range []protoreflect.Name{"BACKGROUND_AUDIO_PRESET_NONE", "BACKGROUND_AUDIO_PRESET_CAFE", "BACKGROUND_AUDIO_PRESET_OFFICE", "BACKGROUND_AUDIO_PRESET_CONTACT_CENTER", "BACKGROUND_AUDIO_PRESET_LIBRARY"} {
		message := dynamicpb.NewMessage(background)
		message.Set(presetField, protoreflect.ValueOfEnum(presetField.Enum().Values().ByName(presetName).Number()))
		message.Set(volumeField, protoreflect.ValueOfFloat64(0))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(valid preset %s) = %v", presetName, err)
		}
	}
	for _, volume := range []float64{-0.1, 1.1, math.NaN()} {
		message := dynamicpb.NewMessage(background)
		message.Set(presetField, protoreflect.ValueOfEnum(1))
		message.Set(volumeField, protoreflect.ValueOfFloat64(volume))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(volume=%v) = nil, want range rejection", volume)
		}
	}
	unspecified := dynamicpb.NewMessage(background)
	unspecified.Set(volumeField, protoreflect.ValueOfFloat64(0))
	if err := Validate(unspecified); err == nil {
		t.Fatal("Validate(unspecified BackgroundAudio preset) = nil, want rejection")
	}
	unknown := dynamicpb.NewMessage(background)
	unknown.Set(presetField, protoreflect.ValueOfEnum(99))
	unknown.Set(volumeField, protoreflect.ValueOfFloat64(0))
	if err := Validate(unknown); err == nil {
		t.Fatal("Validate(unknown BackgroundAudio preset) = nil, want rejection")
	}

	dtmf := lookup("port.api.v1.DtmfInputRuntime")
	timeoutField := dtmf.Fields().ByName("timeout_seconds")
	endKeyField := dtmf.Fields().ByName("end_key")
	if timeoutField == nil || endKeyField == nil {
		t.Fatal("DtmfInputRuntime missing timeout_seconds or end_key")
	}
	for _, timeout := range []int64{1, 10} {
		message := dynamicpb.NewMessage(dtmf)
		message.Set(timeoutField, protoreflect.ValueOfUint32(uint32(timeout)))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(timeout=%d) = %v", timeout, err)
		}
	}
	for _, endKey := range []string{"0", "#", "*"} {
		message := dynamicpb.NewMessage(dtmf)
		message.Set(timeoutField, protoreflect.ValueOfUint32(3))
		message.Set(endKeyField, protoreflect.ValueOfString(endKey))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(valid end_key=%q) = %v", endKey, err)
		}
	}
	absentEndKey := dynamicpb.NewMessage(dtmf)
	absentEndKey.Set(timeoutField, protoreflect.ValueOfUint32(3))
	if err := Validate(absentEndKey); err != nil {
		t.Fatalf("Validate(absent end_key) = %v", err)
	}
	for _, timeout := range []int64{0, 11} {
		message := dynamicpb.NewMessage(dtmf)
		message.Set(timeoutField, protoreflect.ValueOfUint32(uint32(timeout)))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(timeout=%d) = nil, want range rejection", timeout)
		}
	}
	for _, endKey := range []string{"", "12", "A"} {
		message := dynamicpb.NewMessage(dtmf)
		message.Set(timeoutField, protoreflect.ValueOfUint32(3))
		message.Set(endKeyField, protoreflect.ValueOfString(endKey))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(end_key=%q) = nil, want rejection", endKey)
		}
	}
}

func TestR4CallRuntimeRequiredComponents(t *testing.T) {
	for _, name := range []string{"stt", "tts", "background_audio", "dtmf", "transport", "vad", "speech_policy", "limits"} {
		runtime := validR4CallRuntime()
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
		if err := Validate(runtime); err == nil {
			t.Fatalf("Validate(runtime missing %s) = nil, want rejection", name)
		}
	}
	missingVolume := validR4CallRuntime()
	missingVolume.BackgroundAudio.Volume = nil
	if err := Validate(missingVolume); err == nil {
		t.Fatal("Validate(runtime missing background volume) = nil, want rejection")
	}
}

func validR4CallRuntime() *apiv1.CallRuntimeSnapshot {
	return &apiv1.CallRuntimeSnapshot{
		Stt: &apiv1.SttRuntime{ApiKey: "stt-key", Model: "stt-model", Language: "ko"},
		Tts: &apiv1.TtsRuntime{ApiKey: "tts-key", Model: "tts-model", Language: "ko", VoiceId: "voice-1"},
		BackgroundAudio: &apiv1.BackgroundAudioRuntime{
			Preset: apiv1.BackgroundAudioPreset_BACKGROUND_AUDIO_PRESET_NONE,
			Volume: proto.Float64(0.5),
		},
		Dtmf:         &apiv1.DtmfInputRuntime{TimeoutSeconds: 3},
		Transport:    &apiv1.TransportRuntime{Source: 1, RoomName: "room-1", CallerParticipantIdentity: "caller-1"},
		Vad:          &apiv1.VadRuntime{NoiseCancellation: 3, RecognitionSensitivity: proto.Float64(0.75)},
		SpeechPolicy: &apiv1.SpeechPolicyRuntime{ResponseSpeed: proto.Float64(1), AllowInterruptions: proto.Bool(false)},
		Limits:       &apiv1.CallLimitsRuntime{DialWaitTimeSeconds: 90, MaxCallDurationSeconds: 900, NoAnswerTimeoutSeconds: 300},
	}
}

func TestR4CallRuntimeEnumPresenceAndNumericBoundaries(t *testing.T) {
	lookup := func(name protoreflect.FullName) protoreflect.MessageDescriptor {
		descriptor, err := protoregistry.GlobalFiles.FindDescriptorByName(name)
		if err != nil {
			t.Fatalf("descriptor %s: %v", name, err)
		}
		return descriptor.(protoreflect.MessageDescriptor)
	}
	transport := lookup("port.api.v1.TransportRuntime")
	vad := lookup("port.api.v1.VadRuntime")
	speech := lookup("port.api.v1.SpeechPolicyRuntime")
	limits := lookup("port.api.v1.CallLimitsRuntime")

	for _, source := range []protoreflect.EnumNumber{1, 2, 3} {
		message := dynamicpb.NewMessage(transport)
		message.Set(transport.Fields().ByName("source"), protoreflect.ValueOfEnum(source))
		message.Set(transport.Fields().ByName("room_name"), protoreflect.ValueOfString("room-1"))
		message.Set(transport.Fields().ByName("caller_participant_identity"), protoreflect.ValueOfString("caller-1"))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(source=%q) = %v", source, err)
		}
	}
	for _, source := range []protoreflect.EnumNumber{0, 99} {
		message := dynamicpb.NewMessage(transport)
		message.Set(transport.Fields().ByName("source"), protoreflect.ValueOfEnum(source))
		message.Set(transport.Fields().ByName("room_name"), protoreflect.ValueOfString("room-1"))
		message.Set(transport.Fields().ByName("caller_participant_identity"), protoreflect.ValueOfString("caller-1"))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(source=%q) = nil, want rejection", source)
		}
	}
	for _, fieldName := range []protoreflect.Name{"room_name", "caller_participant_identity"} {
		message := dynamicpb.NewMessage(transport)
		message.Set(transport.Fields().ByName("source"), protoreflect.ValueOfEnum(1))
		message.Set(transport.Fields().ByName("room_name"), protoreflect.ValueOfString("room-1"))
		message.Set(transport.Fields().ByName("caller_participant_identity"), protoreflect.ValueOfString("caller-1"))
		message.Set(transport.Fields().ByName(fieldName), protoreflect.ValueOfString(""))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(empty %s) = nil, want rejection", fieldName)
		}
	}

	for _, noise := range []protoreflect.EnumNumber{1, 2, 3} {
		message := dynamicpb.NewMessage(vad)
		message.Set(vad.Fields().ByName("noise_cancellation"), protoreflect.ValueOfEnum(noise))
		message.Set(vad.Fields().ByName("recognition_sensitivity"), protoreflect.ValueOfFloat64(0.5))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(noise=%q) = %v", noise, err)
		}
	}
	for _, sensitivity := range []float64{0.5, 0.75} {
		message := dynamicpb.NewMessage(vad)
		message.Set(vad.Fields().ByName("noise_cancellation"), protoreflect.ValueOfEnum(3))
		message.Set(vad.Fields().ByName("recognition_sensitivity"), protoreflect.ValueOfFloat64(sensitivity))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(sensitivity=%v) = %v", sensitivity, err)
		}
	}
	for _, sensitivity := range []float64{0.49, 0.76, math.NaN(), math.Inf(1)} {
		message := dynamicpb.NewMessage(vad)
		message.Set(vad.Fields().ByName("noise_cancellation"), protoreflect.ValueOfEnum(3))
		message.Set(vad.Fields().ByName("recognition_sensitivity"), protoreflect.ValueOfFloat64(sensitivity))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(sensitivity=%v) = nil, want rejection", sensitivity)
		}
	}
	missingSensitivity := dynamicpb.NewMessage(vad)
	missingSensitivity.Set(vad.Fields().ByName("noise_cancellation"), protoreflect.ValueOfEnum(3))
	if err := Validate(missingSensitivity); err == nil {
		t.Fatal("Validate(missing recognition_sensitivity) = nil, want rejection")
	}

	for _, responseSpeed := range []float64{0, 1} {
		message := dynamicpb.NewMessage(speech)
		message.Set(speech.Fields().ByName("response_speed"), protoreflect.ValueOfFloat64(responseSpeed))
		message.Set(speech.Fields().ByName("allow_interruptions"), protoreflect.ValueOfBool(false))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(response_speed=%v) = %v", responseSpeed, err)
		}
	}
	for _, responseSpeed := range []float64{-0.01, 1.01, math.NaN(), math.Inf(-1)} {
		message := dynamicpb.NewMessage(speech)
		message.Set(speech.Fields().ByName("response_speed"), protoreflect.ValueOfFloat64(responseSpeed))
		message.Set(speech.Fields().ByName("allow_interruptions"), protoreflect.ValueOfBool(false))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(response_speed=%v) = nil, want rejection", responseSpeed)
		}
	}
	missingInterruptions := dynamicpb.NewMessage(speech)
	missingInterruptions.Set(speech.Fields().ByName("response_speed"), protoreflect.ValueOfFloat64(0.5))
	if err := Validate(missingInterruptions); err == nil {
		t.Fatal("Validate(missing allow_interruptions) = nil, want rejection")
	}
	missingResponseSpeed := dynamicpb.NewMessage(speech)
	missingResponseSpeed.Set(speech.Fields().ByName("allow_interruptions"), protoreflect.ValueOfBool(false))
	if err := Validate(missingResponseSpeed); err == nil {
		t.Fatal("Validate(missing response_speed) = nil, want rejection")
	}

	for _, values := range [][3]uint32{{10, 60, 10}, {90, 900, 300}} {
		message := dynamicpb.NewMessage(limits)
		message.Set(limits.Fields().ByName("dial_wait_time_seconds"), protoreflect.ValueOfUint32(values[0]))
		message.Set(limits.Fields().ByName("max_call_duration_seconds"), protoreflect.ValueOfUint32(values[1]))
		message.Set(limits.Fields().ByName("no_answer_timeout_seconds"), protoreflect.ValueOfUint32(values[2]))
		if err := Validate(message); err != nil {
			t.Fatalf("Validate(limits=%v) = %v", values, err)
		}
	}
	for _, values := range [][3]uint32{{9, 60, 10}, {90, 901, 300}, {90, 900, 301}} {
		message := dynamicpb.NewMessage(limits)
		message.Set(limits.Fields().ByName("dial_wait_time_seconds"), protoreflect.ValueOfUint32(values[0]))
		message.Set(limits.Fields().ByName("max_call_duration_seconds"), protoreflect.ValueOfUint32(values[1]))
		message.Set(limits.Fields().ByName("no_answer_timeout_seconds"), protoreflect.ValueOfUint32(values[2]))
		if err := Validate(message); err == nil {
			t.Fatalf("Validate(limits=%v) = nil, want rejection", values)
		}
	}
}

func validR4AgentRuntime() *apiv1.AgentRuntime {
	return &apiv1.AgentRuntime{
		AgentId:        "agent-1",
		AgentVersionId: "agent-version-1",
		LlmWorker:      &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Instructions:   &apiv1.AgentInstructions{SystemPrompt: "Help."},
		ContextPolicy:  apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
	}
}

func validR4SpecialistRuntime() *apiv1.AgentRuntime {
	return &apiv1.AgentRuntime{
		AgentId:        "agent-2",
		AgentVersionId: "agent-version-2",
		LlmWorker:      &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Instructions:   &apiv1.AgentInstructions{SystemPrompt: "Handle billing."},
		ContextPolicy:  apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
	}
}

func validR4DirectResponse() *apiv1.BootstrapAgentResponse {
	return &apiv1.BootstrapAgentResponse{
		ContractRevision: "orchestration-2026-08-07-r4",
		SchemaVersion:    "agent.orchestration.v1",
		ConversationId:   "conversation-1",
		SessionId:        "session-1",
		CallRuntime:      validR4CallRuntime(),
		AgentRuntime:     validR4AgentRuntime(),
	}
}

func validR4SupervisorResponse() *apiv1.BootstrapOrchestrationResponse {
	return &apiv1.BootstrapOrchestrationResponse{
		ContractRevision:       "orchestration-2026-08-07-r4",
		SchemaVersion:          "agent.orchestration.v1",
		ConversationId:         "conversation-1",
		SessionId:              "session-1",
		OrchestrationId:        "orchestration-1",
		OrchestrationVersionId: "orchestration-version-1",
		Mode:                   apiv1.OrchestrationMode_ORCHESTRATION_MODE_SUPERVISOR,
		CallRuntime:            validR4CallRuntime(),
		AgentRuntimes:          []*apiv1.AgentRuntime{validR4AgentRuntime(), validR4SpecialistRuntime()},
		Supervisor: &apiv1.SupervisorSnapshot{
			SupervisorAgentVersionId: "agent-version-1",
			Specialists: []*apiv1.SupervisorSpecialist{{
				RelationId:           "relation-1",
				TargetAgentVersionId: "agent-version-2",
				RouteDescription:     "Billing",
				ContextPolicy:        apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
			}},
		},
	}
}

func validR4HandoffResponse() *apiv1.BootstrapOrchestrationResponse {
	response := validR4SupervisorResponse()
	response.Mode = apiv1.OrchestrationMode_ORCHESTRATION_MODE_HANDOFF
	response.Supervisor = nil
	response.Handoff = &apiv1.HandoffSnapshot{
		EntryAgentVersionId: "agent-version-1",
		MaxHandoffDepth:     2,
		Routes: []*apiv1.HandoffRoute{{
			TransitionId:         "transition-1",
			SourceAgentVersionId: "agent-version-1",
			TargetAgentVersionId: "agent-version-2",
			RoutingDescription:   "Billing",
			ContextPolicy:        apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION,
		}},
	}
	return response
}

func TestR4RevisionSchemaAndAgentRuntimeValidation(t *testing.T) {
	validAdmission := &apiv1.BootstrapRequest{Admission: &apiv1.BootstrapRequest_WebrtcTicket{WebrtcTicket: "ticket"}}
	revisionMessages := []proto.Message{
		&apiv1.BootstrapAgentRequest{Admission: validAdmission, ConversationId: "conversation-1", SessionId: "session-1", AgentVersionId: "agent-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
		&apiv1.BootstrapOrchestrationRequest{Admission: validAdmission, ConversationId: "conversation-1", SessionId: "session-1", OrchestrationVersionId: "orchestration-version-1", ContractRevision: "orchestration-2026-08-07-r4"},
		validR4DirectResponse(),
		validR4SupervisorResponse(),
	}
	for _, source := range revisionMessages {
		if err := Validate(source); err != nil {
			t.Fatalf("Validate(valid %T) = %v", source, err)
		}
		for _, revision := range []string{"", "orchestration-unsupported"} {
			message := proto.Clone(source)
			field := message.ProtoReflect().Descriptor().Fields().ByName("contract_revision")
			message.ProtoReflect().Set(field, protoreflect.ValueOfString(revision))
			if err := Validate(message); err == nil {
				t.Fatalf("Validate(%T contract_revision=%q) = nil, want rejection", source, revision)
			}
		}
	}

	for _, source := range []proto.Message{validR4DirectResponse(), validR4SupervisorResponse()} {
		for _, schemaVersion := range []string{"", "agent.orchestration.v0"} {
			message := proto.Clone(source)
			field := message.ProtoReflect().Descriptor().Fields().ByName("schema_version")
			message.ProtoReflect().Set(field, protoreflect.ValueOfString(schemaVersion))
			if err := Validate(message); err == nil {
				t.Fatalf("Validate(%T schema_version=%q) = nil, want rejection", source, schemaVersion)
			}
		}
	}

	agentRuntimeTests := []struct {
		name   string
		mutate func(*apiv1.BootstrapAgentResponse)
	}{
		{"missing LLM worker", func(response *apiv1.BootstrapAgentResponse) { response.AgentRuntime.LlmWorker = nil }},
		{"missing instructions", func(response *apiv1.BootstrapAgentResponse) { response.AgentRuntime.Instructions = nil }},
	}
	for _, tt := range agentRuntimeTests {
		t.Run(tt.name, func(t *testing.T) {
			response := validR4DirectResponse()
			tt.mutate(response)
			if err := Validate(response); err == nil {
				t.Fatal("Validate() = nil, want AgentRuntime validation error")
			}
		})
	}

	orchestration := validR4SupervisorResponse()
	orchestration.AgentRuntimes[1].Instructions = nil
	if err := Validate(orchestration); err == nil {
		t.Fatal("Validate(orchestration with invalid AgentRuntime) = nil, want rejection")
	}
}

func TestR4OrchestrationValidation(t *testing.T) {
	valid := validR4SupervisorResponse()
	if err := Validate(valid); err != nil {
		t.Fatalf("Validate(valid supervisor response) = %v", err)
	}

	validHandoff := validR4HandoffResponse()
	if err := Validate(validHandoff); err != nil {
		t.Fatalf("Validate(valid handoff response) = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*apiv1.BootstrapOrchestrationResponse)
	}{
		{"mode snapshot mismatch", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Mode = apiv1.OrchestrationMode_ORCHESTRATION_MODE_HANDOFF
		}},
		{"both snapshots", func(response *apiv1.BootstrapOrchestrationResponse) { response.Handoff = validHandoff.Handoff }},
		{"missing snapshot", func(response *apiv1.BootstrapOrchestrationResponse) { response.Supervisor = nil }},
		{"unspecified mode", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Mode = apiv1.OrchestrationMode_ORCHESTRATION_MODE_UNSPECIFIED
		}},
		{"unknown mode", func(response *apiv1.BootstrapOrchestrationResponse) { response.Mode = 99 }},
		{"duplicate runtime version", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.AgentRuntimes = append(response.AgentRuntimes, proto.Clone(response.AgentRuntimes[0]).(*apiv1.AgentRuntime))
		}},
		{"missing supervisor runtime", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Supervisor.SupervisorAgentVersionId = "missing-version"
		}},
		{"missing specialist runtime", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Supervisor.Specialists[0].TargetAgentVersionId = "missing-version"
		}},
		{"duplicate specialist relation", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Supervisor.Specialists = append(response.Supervisor.Specialists, proto.Clone(response.Supervisor.Specialists[0]).(*apiv1.SupervisorSpecialist))
		}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := proto.Clone(valid).(*apiv1.BootstrapOrchestrationResponse)
			tt.mutate(response)
			if err := Validate(response); err == nil {
				t.Fatal("Validate() = nil, want orchestration validation error")
			}
		})
	}

	handoffTests := []struct {
		name   string
		mutate func(*apiv1.BootstrapOrchestrationResponse)
	}{
		{"missing entry runtime", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Handoff.EntryAgentVersionId = "missing-version"
		}},
		{"missing source runtime", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Handoff.Routes[0].SourceAgentVersionId = "missing-version"
		}},
		{"missing target runtime", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Handoff.Routes[0].TargetAgentVersionId = "missing-version"
		}},
		{"duplicate handoff transition", func(response *apiv1.BootstrapOrchestrationResponse) {
			response.Handoff.Routes = append(response.Handoff.Routes, proto.Clone(response.Handoff.Routes[0]).(*apiv1.HandoffRoute))
		}},
	}
	for _, tt := range handoffTests {
		t.Run(tt.name, func(t *testing.T) {
			response := proto.Clone(validHandoff).(*apiv1.BootstrapOrchestrationResponse)
			tt.mutate(response)
			if err := Validate(response); err == nil {
				t.Fatal("Validate() = nil, want handoff validation error")
			}
		})
	}
}

func TestR4GeneratedGoWireRoundTrip(t *testing.T) {
	direct := validR4DirectResponse()
	supervisor := validR4SupervisorResponse()
	handoff := validR4HandoffResponse()

	for _, source := range []proto.Message{direct, supervisor, handoff} {
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

func TestR4CallRuntimeDescriptorRetainsBackgroundAudioAndDtmfBoundaries(t *testing.T) {
	runtimeDescriptor, err := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.CallRuntimeSnapshot")
	if err != nil {
		t.Fatal(err)
	}
	fields := runtimeDescriptor.(protoreflect.MessageDescriptor).Fields()
	for _, fieldName := range []protoreflect.Name{"background_audio", "dtmf"} {
		if fields.ByName(fieldName) == nil {
			t.Fatalf("CallRuntimeSnapshot missing required field %q", fieldName)
		}
	}

	agentRuntimeDescriptor, err := protoregistry.GlobalFiles.FindDescriptorByName("port.api.v1.AgentRuntime")
	if err != nil {
		t.Fatal(err)
	}
	agentFields := agentRuntimeDescriptor.(protoreflect.MessageDescriptor).Fields()
	for _, forbidden := range []protoreflect.Name{"transport", "stt", "tts", "voice", "vad", "background_audio", "dtmf", "interruption"} {
		if agentFields.ByName(forbidden) != nil {
			t.Fatalf("AgentRuntime unexpectedly owns CallRuntime field %q", forbidden)
		}
	}
}

func TestValidateAcceptsValidRequest(t *testing.T) {
	err := Validate(&apiv1.RecordGatewayEventRequest{
		EventType:      apiv1.GatewayLifecycleEventType_GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED,
		ConversationId: "conversation-1",
		OccurredAt:     timestamppb.Now(),
	})
	if err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}

func TestValidateOrchestrationGraphTable(t *testing.T) {
	validGraph := &apiv1.OrchestrationGraphSnapshot{
		SnapshotId: "snapshot-1", VersionId: "version-1", SchemaVersion: "agent.orchestration.v1", EntryNodeId: "agent-node-1", MaxHandoffDepth: 2,
		Nodes: []*apiv1.OrchestrationNode{
			{NodeId: "agent-node-1", Kind: apiv1.NodeKind_NODE_KIND_AGENT, Position: &apiv1.CanvasPosition{}, Size: &apiv1.CanvasSize{}, Payload: &apiv1.OrchestrationNode_Agent{Agent: &apiv1.OrchestrationAgent{AgentId: "agent-1", AgentVersionId: "agent-version-1", Persona: &apiv1.OrchestrationAgentPersona{DisplayName: "Agent", SystemPrompt: "Help."}, ExecutionProfile: &apiv1.OrchestrationExecutionProfile{LlmModel: "model-1"}, ToolSnapshotId: "tools-1"}}},
			{NodeId: "agent-node-2", Kind: apiv1.NodeKind_NODE_KIND_AGENT, Position: &apiv1.CanvasPosition{}, Size: &apiv1.CanvasSize{}, Payload: &apiv1.OrchestrationNode_Agent{Agent: &apiv1.OrchestrationAgent{AgentId: "agent-2", AgentVersionId: "agent-version-2", Persona: &apiv1.OrchestrationAgentPersona{DisplayName: "Agent Two", SystemPrompt: "Continue."}, ExecutionProfile: &apiv1.OrchestrationExecutionProfile{LlmModel: "model-2"}, ToolSnapshotId: "tools-2"}}},
			{NodeId: "task-node-1", Kind: apiv1.NodeKind_NODE_KIND_TASK, Position: &apiv1.CanvasPosition{}, Size: &apiv1.CanvasSize{}, Payload: &apiv1.OrchestrationNode_Task{Task: &apiv1.OrchestrationTask{Name: "Task", Instructions: "Do it.", CompletionInstructions: "Report it.", ToolSnapshotId: "tools-3"}}},
			{NodeId: "group-node-1", Kind: apiv1.NodeKind_NODE_KIND_GROUP, Position: &apiv1.CanvasPosition{}, Size: &apiv1.CanvasSize{}, Payload: &apiv1.OrchestrationNode_Group{Group: &apiv1.OrchestrationGroup{Label: "Group"}}},
		},
		Transitions: []*apiv1.OrchestrationTransition{
			{TransitionId: "delegate-1", SourceNodeId: "agent-node-1", TargetNodeId: "task-node-1", Kind: apiv1.TransitionKind_TRANSITION_KIND_DELEGATE, Description: "Delegate", ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION},
			{TransitionId: "handoff-1", SourceNodeId: "agent-node-1", TargetNodeId: "agent-node-2", Kind: apiv1.TransitionKind_TRANSITION_KIND_HANDOFF, Description: "Handoff", ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_NONE},
		},
		NodeToolSnapshots: []*apiv1.NodeToolSnapshot{
			{SnapshotId: "tools-1", VersionId: "version-1", NodeId: "agent-node-1", Tools: []*apiv1.NodeToolMetadata{{ToolId: "tool-1", Kind: "api", Name: "lookup", Metadata: &apiv1.NodeToolMetadata_Api{Api: &apiv1.ApiToolMetadata{Method: "GET", Url: "https://example.com"}}}}},
			{SnapshotId: "tools-2", VersionId: "version-1", NodeId: "agent-node-2"},
			{SnapshotId: "tools-3", VersionId: "version-1", NodeId: "task-node-1"},
		},
	}
	tests := []struct {
		name string
		msg  *apiv1.OrchestrationGraphSnapshot
		want bool
	}{
		{
			name: "valid",
			msg:  validGraph,
			want: true,
		},
		{name: "missing snapshot id", msg: &apiv1.OrchestrationGraphSnapshot{VersionId: "version-1", SchemaVersion: "agent.orchestration.v1", EntryNodeId: "agent-1", MaxHandoffDepth: 2}},
		{name: "wrong schema", msg: &apiv1.OrchestrationGraphSnapshot{SnapshotId: "snapshot-1", VersionId: "version-1", SchemaVersion: "agent.canvas.v1", EntryNodeId: "agent-1", MaxHandoffDepth: 2}},
		{name: "zero depth", msg: &apiv1.OrchestrationGraphSnapshot{SnapshotId: "snapshot-1", VersionId: "version-1", SchemaVersion: "agent.orchestration.v1", EntryNodeId: "agent-1"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.msg)
			if (err == nil) != tt.want {
				t.Fatalf("Validate() error = %v, want valid = %v", err, tt.want)
			}
		})
	}
}

func TestValidateOrchestrationNodeAndTransitionEnums(t *testing.T) {
	validAgent := &apiv1.OrchestrationAgent{
		AgentId: "agent-1", AgentVersionId: "version-1",
		Persona:          &apiv1.OrchestrationAgentPersona{DisplayName: "Agent", SystemPrompt: "Help."},
		ExecutionProfile: &apiv1.OrchestrationExecutionProfile{LlmModel: "model-1"},
	}
	tests := []struct {
		name string
		msg  proto.Message
		want bool
	}{
		{name: "node kind unspecified", msg: &apiv1.OrchestrationNode{NodeId: "node-1", Kind: apiv1.NodeKind_NODE_KIND_UNSPECIFIED, Position: &apiv1.CanvasPosition{}, Size: &apiv1.CanvasSize{}, Payload: &apiv1.OrchestrationNode_Agent{Agent: validAgent}}, want: false},
		{name: "agent persona missing", msg: &apiv1.OrchestrationAgent{AgentId: "agent-1", AgentVersionId: "version-1", ExecutionProfile: validAgent.ExecutionProfile}, want: false},
		{name: "agent execution profile missing", msg: &apiv1.OrchestrationAgent{AgentId: "agent-1", AgentVersionId: "version-1", Persona: validAgent.Persona}, want: false},
		{name: "transition kind unspecified", msg: &apiv1.OrchestrationTransition{TransitionId: "t-1", SourceNodeId: "a", TargetNodeId: "b", Kind: apiv1.TransitionKind_TRANSITION_KIND_UNSPECIFIED, Description: "Route", ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_CONVERSATION}, want: false},
		{name: "transition context unspecified", msg: &apiv1.OrchestrationTransition{TransitionId: "t-1", SourceNodeId: "a", TargetNodeId: "b", Kind: apiv1.TransitionKind_TRANSITION_KIND_HANDOFF, Description: "Route", ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_UNSPECIFIED}, want: false},
		{name: "task empty instructions", msg: &apiv1.OrchestrationTask{Name: "Task", CompletionInstructions: "Report"}, want: false},
		{name: "task empty completion", msg: &apiv1.OrchestrationTask{Name: "Task", Instructions: "Do it"}, want: false},
		{name: "transition empty description", msg: &apiv1.OrchestrationTransition{TransitionId: "t-1", SourceNodeId: "a", TargetNodeId: "b", Kind: apiv1.TransitionKind_TRANSITION_KIND_HANDOFF, ContextPolicy: apiv1.ContextPolicy_CONTEXT_POLICY_NONE}, want: false},
		{name: "tool snapshot missing node", msg: &apiv1.NodeToolSnapshot{SnapshotId: "tools", VersionId: "version"}, want: false},
		{name: "tool metadata missing id", msg: &apiv1.NodeToolMetadata{Kind: "api", Name: "lookup"}, want: false},
		{name: "tool metadata invalid kind", msg: &apiv1.NodeToolMetadata{ToolId: "tool", Kind: "other", Name: "lookup"}, want: false},
		{name: "tool metadata missing name", msg: &apiv1.NodeToolMetadata{ToolId: "tool", Kind: "api"}, want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.msg)
			if (err == nil) != tt.want {
				t.Fatalf("Validate() error = %v, want valid = %v", err, tt.want)
			}
		})
	}
}

func TestValidateLegacyBootstrapWithoutOrchestrationGraph(t *testing.T) {
	response := &apiv1.BootstrapResponse{
		ConversationId: "conversation-1", SessionId: "session-1", Source: "text_stream", RoomName: "room-1", AgentToolSnapshotId: "tools-1", AgentId: "supervisor-1",
		Stt:          &apiv1.SttRuntime{ApiKey: "stt-key", Model: "stt-model", Language: "en"},
		Llm:          &apiv1.LlmRuntime{ApiKey: "llm-key", Model: "llm-model"},
		Tts:          &apiv1.TtsRuntime{ApiKey: "tts-key", Model: "tts-model", Language: "en", VoiceId: "voice-1"},
		SupervisorId: "supervisor-1", SupervisorVersionId: "version-1",
		SupervisorPersona:   &apiv1.SupervisorPersona{DisplayName: "Supervisor", SystemPrompt: "Route."},
		SupervisorConfig:    &apiv1.SupervisorConfig{},
		Canvas:              &apiv1.CanvasSnapshot{SnapshotId: "canvas-1", VersionId: "version-1", SchemaVersion: "1"},
		BootstrapSnapshotId: "bootstrap-1",
	}
	if response.OrchestrationGraph != nil {
		t.Fatal("OrchestrationGraph = non-nil, want nil")
	}
	if err := Validate(response); err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}
