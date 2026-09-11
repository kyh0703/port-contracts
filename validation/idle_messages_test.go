package validation

import (
	"strings"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
)

func TestIdleMessageValidation(t *testing.T) {
	for _, mode := range []string{"exact", "prompt"} {
		for _, reset := range []bool{false, true} {
			valid := &apiv1.IdleMessageRuntime{Mode: mode, Message: "  여보세요?\n  ", TimeoutSeconds: 10, MaxCount: 1, ResetOnUserSpeech: reset}
			if err := Validate(valid); err != nil {
				t.Fatalf("Validate(%v) = %v", valid, err)
			}
		}
	}
	for _, tc := range []struct {
		name   string
		change func(*apiv1.IdleMessageRuntime)
	}{
		{"invalid mode", func(m *apiv1.IdleMessageRuntime) { m.Mode = "unknown" }},
		{"blank message", func(m *apiv1.IdleMessageRuntime) { m.Message = " \n\t" }},
		{"long message", func(m *apiv1.IdleMessageRuntime) { m.Message = strings.Repeat("가", 1001) }},
		{"zero timeout", func(m *apiv1.IdleMessageRuntime) { m.TimeoutSeconds = 0 }},
		{"high timeout", func(m *apiv1.IdleMessageRuntime) { m.TimeoutSeconds = 1001 }},
		{"zero count", func(m *apiv1.IdleMessageRuntime) { m.MaxCount = 0 }},
		{"high count", func(m *apiv1.IdleMessageRuntime) { m.MaxCount = 11 }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			m := &apiv1.IdleMessageRuntime{Mode: "exact", Message: "여보세요?", TimeoutSeconds: 10, MaxCount: 1}
			tc.change(m)
			if err := Validate(&apiv1.ConversationControlRuntime{IdleMessage: m}); err == nil {
				t.Fatal("expected invalid idle settings to be rejected")
			}
		})
	}
	if err := Validate(&apiv1.ConversationControlRuntime{}); err != nil {
		t.Fatalf("legacy controls must remain valid: %v", err)
	}
}
