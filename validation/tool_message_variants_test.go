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
