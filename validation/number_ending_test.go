package validation

import (
	"math"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func TestNumberEndingWaitValidation(t *testing.T) {
	policy := &apiv1.SpeechPolicyRuntime{ResponseSpeed: proto.Float64(1), AllowInterruptions: proto.Bool(true)}
	if err := Validate(policy); err != nil {
		t.Fatalf("legacy unset wait must remain valid: %v", err)
	}
	for _, value := range []float64{0, 0.25, 0.5, 3} {
		policy.EotOnNumberSecs = proto.Float64(value)
		if err := Validate(policy); err != nil {
			t.Fatalf("valid wait %v rejected: %v", value, err)
		}
	}
	for _, value := range []float64{-0.1, 3.1, math.NaN(), math.Inf(1), math.Inf(-1)} {
		policy.EotOnNumberSecs = proto.Float64(value)
		if err := Validate(policy); err == nil {
			t.Fatalf("invalid wait %v accepted", value)
		}
	}
}
