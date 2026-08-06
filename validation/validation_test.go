package validation

import (
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func TestValidateRejectsMissingRequiredFields(t *testing.T) {
	err := Validate(&apiv1.RecordGatewayEventRequest{})
	if err == nil {
		t.Fatal("Validate() error = nil, want validation error")
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
