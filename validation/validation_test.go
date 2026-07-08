package validation

import (
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/gen/go/port/api/v1"
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
