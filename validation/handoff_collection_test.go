package validation

import (
	apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
	"strings"
	"testing"
)

func TestHandoffCollectionValidation(t *testing.T) {
	valid := func() *apiv1.HandoffParameter {
		return &apiv1.HandoffParameter{
			Name: "휴대폰번호", Type: apiv1.HandoffParameterType_HANDOFF_PARAMETER_TYPE_STRING, Required: true,
			Collection: &apiv1.HandoffParameterCollection{Input: "dtmf", Digits: 11, Prompt: "번호를 입력해 주세요.", TimeoutSeconds: 60},
		}
	}
	if err := Validate(valid()); err != nil {
		t.Fatalf("valid collection: %v", err)
	}
	for _, tc := range []struct {
		name   string
		change func(*apiv1.HandoffParameter)
	}{
		{"optional", func(p *apiv1.HandoffParameter) { p.Required = false }},
		{"number", func(p *apiv1.HandoffParameter) { p.Type = apiv1.HandoffParameterType_HANDOFF_PARAMETER_TYPE_NUMBER }},
		{"enum", func(p *apiv1.HandoffParameter) { p.StringEnum = []string{"1"} }},
		{"input", func(p *apiv1.HandoffParameter) { p.Collection.Input = "speech" }},
		{"zero digits", func(p *apiv1.HandoffParameter) { p.Collection.Digits = 0 }},
		{"too many digits", func(p *apiv1.HandoffParameter) { p.Collection.Digits = 33 }},
		{"short timeout", func(p *apiv1.HandoffParameter) { p.Collection.TimeoutSeconds = 4 }},
		{"long timeout", func(p *apiv1.HandoffParameter) { p.Collection.TimeoutSeconds = 121 }},
		{"blank prompt", func(p *apiv1.HandoffParameter) { p.Collection.Prompt = " \n\t" }},
		{"long prompt", func(p *apiv1.HandoffParameter) { p.Collection.Prompt = strings.Repeat("가", 1001) }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			p := valid()
			tc.change(p)
			if Validate(p) == nil {
				t.Fatal("invalid collection accepted")
			}
		})
	}
	for _, digits := range []uint32{1, 32} {
		p := valid()
		p.Collection.Digits = digits
		p.Collection.Confirm = true
		if err := Validate(p); err != nil {
			t.Fatalf("boundary collection: %v", err)
		}
	}
	p := valid()
	p.Collection = nil
	p.Required = false
	if err := Validate(p); err != nil {
		t.Fatalf("legacy parameter rejected: %v", err)
	}
}

func TestWebFormCollectionFormatConstraints(t *testing.T) {
	format := "birthdate"
	collection := &apiv1.HandoffParameterCollection{
		Input: "web_form", Digits: 8, Prompt: "생년월일", TimeoutSeconds: 60, Format: &format,
	}
	if err := Validate(collection); err != nil {
		t.Fatalf("valid birthdate form rejected: %v", err)
	}
	collection.Digits = 6
	if Validate(collection) == nil {
		t.Fatal("ambiguous six-digit birthdate accepted")
	}
	format = "phone"
	collection.Digits = 11
	if err := Validate(collection); err != nil {
		t.Fatalf("valid phone form rejected: %v", err)
	}
	collection.Confirm = true
	if Validate(collection) == nil {
		t.Fatal("keypad confirmation accepted for a web form")
	}
	collection.Confirm = false
	collection.Input = "dtmf"
	if Validate(collection) == nil {
		t.Fatal("web form validation format accepted for DTMF")
	}
}

func TestCollectionRevisionR2OnBootstrap(t *testing.T) {
	request := validPublishedRequest()
	request.ContractRevision = "execution-publication-2026-09-15-r2"
	if err := Validate(request); err != nil {
		t.Fatalf("r2 request rejected: %v", err)
	}
	response := validAgentTextResponse()
	response.ContractRevision = "execution-publication-2026-09-15-r2"
	if err := Validate(response); err != nil {
		t.Fatalf("r2 response rejected: %v", err)
	}
	request.ContractRevision = "unknown-revision"
	if Validate(request) == nil {
		t.Fatal("unknown revision accepted")
	}
}
