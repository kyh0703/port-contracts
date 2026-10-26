package validation

import (
	"math"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func sonioxPolicyRuntime(policy *apiv1.SonioxEndpointingRuntime) *apiv1.SttRuntime {
	return &apiv1.SttRuntime{
		Credential: &apiv1.SttRuntime_LeaseId{LeaseId: "original-stt"},
		Model:      "stt-rt-v5", Language: "ko", Provider: proto.String("soniox"),
		SonioxEndpointing: policy,
	}
}

func TestSonioxEndpointingValidation(t *testing.T) {
	if err := Validate(sonioxPolicyRuntime(nil)); err != nil {
		t.Fatalf("legacy absent policy must remain valid: %v", err)
	}
	valid := []struct {
		name   string
		policy *apiv1.SonioxEndpointingRuntime
	}{
		{"server zeros", &apiv1.SonioxEndpointingRuntime{ServerTurnDetection: true, MaxDelayMs: 2000}},
		{"inactive prepared policy", &apiv1.SonioxEndpointingRuntime{LatencyAdjustmentLevel: 2, Sensitivity: -0.3, MaxDelayMs: 750}},
		{"lower sensitivity upper bounds", &apiv1.SonioxEndpointingRuntime{ServerTurnDetection: true, LatencyAdjustmentLevel: 3, Sensitivity: -1, MaxDelayMs: 3000}},
		{"upper sensitivity lower delay", &apiv1.SonioxEndpointingRuntime{ServerTurnDetection: true, Sensitivity: 1, MaxDelayMs: 500}},
	}
	for _, tc := range valid {
		t.Run(tc.name, func(t *testing.T) {
			if err := Validate(sonioxPolicyRuntime(tc.policy)); err != nil {
				t.Fatalf("valid policy rejected: %v", err)
			}
		})
	}
	invalid := []struct {
		name   string
		mutate func(*apiv1.SonioxEndpointingRuntime)
	}{
		{"level too large", func(p *apiv1.SonioxEndpointingRuntime) { p.LatencyAdjustmentLevel = 4 }},
		{"missing maximum delay", func(p *apiv1.SonioxEndpointingRuntime) { p.MaxDelayMs = 0 }},
		{"delay too short", func(p *apiv1.SonioxEndpointingRuntime) { p.MaxDelayMs = 499 }},
		{"delay too long", func(p *apiv1.SonioxEndpointingRuntime) { p.MaxDelayMs = 3001 }},
		{"sensitivity too small", func(p *apiv1.SonioxEndpointingRuntime) { p.Sensitivity = -1.1 }},
		{"sensitivity too large", func(p *apiv1.SonioxEndpointingRuntime) { p.Sensitivity = 1.1 }},
		{"sensitivity NaN", func(p *apiv1.SonioxEndpointingRuntime) { p.Sensitivity = math.NaN() }},
		{"sensitivity positive infinity", func(p *apiv1.SonioxEndpointingRuntime) { p.Sensitivity = math.Inf(1) }},
		{"sensitivity negative infinity", func(p *apiv1.SonioxEndpointingRuntime) { p.Sensitivity = math.Inf(-1) }},
	}
	for _, tc := range invalid {
		t.Run(tc.name, func(t *testing.T) {
			policy := &apiv1.SonioxEndpointingRuntime{MaxDelayMs: 2000}
			tc.mutate(policy)
			if err := Validate(sonioxPolicyRuntime(policy)); err == nil {
				t.Fatal("invalid policy accepted")
			}
		})
	}
	for _, enabled := range []bool{false, true} {
		runtime := sonioxPolicyRuntime(&apiv1.SonioxEndpointingRuntime{ServerTurnDetection: enabled, MaxDelayMs: 2000})
		runtime.Provider = proto.String("xai")
		runtime.Model = "grok-stt"
		if err := Validate(runtime); err == nil {
			t.Fatalf("Soniox policy must not be accepted for another provider (enabled=%v)", enabled)
		}
	}
}
