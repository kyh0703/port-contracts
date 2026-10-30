package validation

import (
	"strings"
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func TestSearchRuntimeAddressValidation(t *testing.T) {
	t.Parallel()
	valid := &apiv1.SearchRuntimeAddressRequest{Owner: validRuntimeOwner(), NodeId: "entry", ToolReference: "019d0000-0000-7000-8000-000000000001", Query: "합성시 검증로 10", SearchType: "address"}
	for _, tc := range []struct {
		name   string
		mutate func(*apiv1.SearchRuntimeAddressRequest)
		valid  bool
	}{
		{"address", func(*apiv1.SearchRuntimeAddressRequest) {}, true},
		{"place", func(r *apiv1.SearchRuntimeAddressRequest) { r.SearchType = "place" }, true},
		{"300 Unicode codepoints", func(r *apiv1.SearchRuntimeAddressRequest) { r.Query = strings.Repeat("😀", 300) }, true},
		{"301 codepoints", func(r *apiv1.SearchRuntimeAddressRequest) { r.Query = strings.Repeat("가", 301) }, false},
		{"missing owner", func(r *apiv1.SearchRuntimeAddressRequest) { r.Owner = nil }, false},
		{"blank node", func(r *apiv1.SearchRuntimeAddressRequest) { r.NodeId = " " }, false},
		{"missing root reference", func(r *apiv1.SearchRuntimeAddressRequest) { r.ToolReference = "" }, false},
		{"blank query", func(r *apiv1.SearchRuntimeAddressRequest) { r.Query = " " }, false},
		{"Unicode blank query", func(r *apiv1.SearchRuntimeAddressRequest) { r.Query = "\u3000" }, false},
		{"control query", func(r *apiv1.SearchRuntimeAddressRequest) { r.Query = "주소\n" }, false},
		{"unsupported type", func(r *apiv1.SearchRuntimeAddressRequest) { r.SearchType = "nearby" }, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r := proto.Clone(valid).(*apiv1.SearchRuntimeAddressRequest)
			tc.mutate(r)
			if err := Validate(r); (err == nil) != tc.valid {
				t.Fatalf("Validate error=%v, valid=%v", err, tc.valid)
			}
		})
	}
}

func TestSearchAddressBindingAndResultBounds(t *testing.T) {
	t.Parallel()
	for _, tc := range []struct {
		message proto.Message
		valid   bool
	}{
		{&apiv1.SearchAddressTool{Condition: "위치 확인", ToolReference: "original-root"}, true},
		{&apiv1.SearchAddressTool{Condition: "위치 확인"}, false},
		{&apiv1.SearchAddressTool{Condition: " ", ToolReference: "original-root"}, false},
		{&apiv1.SearchRuntimeAddressResponse{ResultJson: strings.Repeat("a", 16384)}, true},
		{&apiv1.SearchRuntimeAddressResponse{ResultJson: strings.Repeat("가", 5462)}, false},
	} {
		if err := Validate(tc.message); (err == nil) != tc.valid {
			t.Fatalf("Validate(%T) error=%v, valid=%v", tc.message, err, tc.valid)
		}
	}
}
