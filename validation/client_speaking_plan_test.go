package validation

import (
	"math"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func clientSpeechPolicy(plan *apiv1.ClientSpeakingPlanRuntime) *apiv1.SpeechPolicyRuntime {
	return &apiv1.SpeechPolicyRuntime{
		ResponseSpeed: proto.Float64(1), AllowInterruptions: proto.Bool(true), ClientSpeakingPlan: plan,
	}
}

func TestClientSpeakingPlanValidation(t *testing.T) {
	t.Parallel()
	for _, plan := range []*apiv1.ClientSpeakingPlanRuntime{
		nil,
		{Enabled: true},
		{Enabled: false, OnPunctuationSeconds: 0.1, OnNoPunctuationSeconds: 1.5, OnNumberSeconds: 0.5, WaitSeconds: 0.4},
		{Enabled: true, OnPunctuationSeconds: 3, OnNoPunctuationSeconds: 3, OnNumberSeconds: 3, WaitSeconds: 5},
	} {
		if err := Validate(clientSpeechPolicy(plan)); err != nil {
			t.Fatalf("valid absent/zero/prepared/boundary plan rejected: %v", err)
		}
	}
	fields := []struct {
		name string
		max  float64
		set  func(*apiv1.ClientSpeakingPlanRuntime, float64)
	}{
		{"punctuation", 3, func(p *apiv1.ClientSpeakingPlanRuntime, value float64) { p.OnPunctuationSeconds = value }},
		{"no punctuation", 3, func(p *apiv1.ClientSpeakingPlanRuntime, value float64) { p.OnNoPunctuationSeconds = value }},
		{"number", 3, func(p *apiv1.ClientSpeakingPlanRuntime, value float64) { p.OnNumberSeconds = value }},
		{"audio wait", 5, func(p *apiv1.ClientSpeakingPlanRuntime, value float64) { p.WaitSeconds = value }},
	}
	for _, field := range fields {
		t.Run(field.name, func(t *testing.T) {
			for _, enabled := range []bool{false, true} {
				for _, value := range []float64{-0.001, field.max + 0.001, math.NaN(), math.Inf(1), math.Inf(-1)} {
					plan := &apiv1.ClientSpeakingPlanRuntime{Enabled: enabled}
					field.set(plan, value)
					if err := Validate(clientSpeechPolicy(plan)); err == nil {
						t.Fatalf("invalid value %v accepted with enabled=%v", value, enabled)
					}
				}
			}
		})
	}
}
