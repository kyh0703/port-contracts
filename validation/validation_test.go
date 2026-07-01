package validation

import (
	"testing"

	mediav1 "github.com/kyh0703/port-contracts/gen/go/port/media/v1"
)

func TestValidateRejectsMissingRequiredFields(t *testing.T) {
	err := Validate(&mediav1.CreateSessionRequest{})
	if err == nil {
		t.Fatal("Validate() error = nil, want validation error")
	}
}

func TestValidateAcceptsValidRequest(t *testing.T) {
	err := Validate(&mediav1.CreateSessionRequest{
		SessionId:      "session-1",
		ConversationId: "conversation-1",
	})
	if err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}
}
