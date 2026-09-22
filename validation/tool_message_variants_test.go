package validation

import (
	"testing"

	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"google.golang.org/protobuf/proto"
)

func TestToolMessageVariants(t *testing.T) {
	for _, count := range []int{1, 2, 10, 11} {
		items := make([]*apiv1.ApiToolMessage, count)
		for i := range items {
			items[i] = &apiv1.ApiToolMessage{Type: "request-start", Content: "안내 문구"}
		}
		for _, message := range []proto.Message{
			&apiv1.ToolMessages{Items: items},
			&apiv1.ApiToolMetadata{Method: "GET", Url: "https://example.test", Messages: items},
		} {
			err := Validate(message)
			if count <= 10 && err != nil {
				t.Errorf("Validate(%T, %d candidates) = %v, want nil", message, count, err)
			}
			if count > 10 && err == nil {
				t.Errorf("Validate(%T, %d candidates) = nil, want limit rejection", message, count)
			}
		}
	}
}

func TestToolMessageVariantsAllStages(t *testing.T) {
	var items []*apiv1.ApiToolMessage
	for _, stage := range []string{"request-start", "request-complete", "request-failed", "request-response-delayed"} {
		for range 10 {
			items = append(items, &apiv1.ApiToolMessage{Type: stage, Content: "안내 문구"})
		}
	}
	if err := Validate(&apiv1.ToolMessages{Items: items}); err != nil {
		t.Fatalf("Validate(ten candidates for each of four stages) = %v", err)
	}
}

func TestToolMessageBehavior(t *testing.T) {
	for _, tc := range []struct {
		name    string
		message *apiv1.ApiToolMessage
		valid   bool
	}{
		{"silent start", &apiv1.ApiToolMessage{Type: "request-start", Blocking: proto.Bool(true)}, true},
		{"generated response", &apiv1.ApiToolMessage{Type: "request-complete", Content: "Explain outcome", Role: proto.String("system")}, true},
		{"empty prompt", &apiv1.ApiToolMessage{Type: "request-complete", Role: proto.String("system")}, false},
		{"invalid start role", &apiv1.ApiToolMessage{Type: "request-start", Content: "x", Role: proto.String("system")}, false},
		{"long delay", &apiv1.ApiToolMessage{Type: "request-response-delayed", Content: "wait", TimingMilliseconds: proto.Uint32(120000)}, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if err := Validate(tc.message); (err == nil) != tc.valid {
				t.Fatalf("Validate = %v, valid = %v", err, tc.valid)
			}
		})
	}
}
