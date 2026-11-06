package validation

import (
	"math"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func TestModelFrequencyPenaltyValidation(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name    string
		value   *float64
		wantErr bool
	}{
		{name: "absent"},
		{name: "explicit zero", value: proto.Float64(0)},
		{name: "saved fraction", value: proto.Float64(0.3)},
		{name: "upper boundary", value: proto.Float64(2)},
		{name: "below lower boundary", value: proto.Float64(-0.001), wantErr: true},
		{name: "above upper boundary", value: proto.Float64(2.001), wantErr: true},
		{name: "NaN", value: proto.Float64(math.NaN()), wantErr: true},
		{name: "positive infinity", value: proto.Float64(math.Inf(1)), wantErr: true},
		{name: "negative infinity", value: proto.Float64(math.Inf(-1)), wantErr: true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			options := &apiv1.InlineAuthoringOptions{
				Model: &apiv1.NodeModelSettings{FrequencyPenalty: tc.value},
			}
			err := Validate(options)
			if (err != nil) != tc.wantErr {
				t.Fatalf("Validate() = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}
