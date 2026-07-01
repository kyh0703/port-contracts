package validation

import (
	"buf.build/go/protovalidate"
	"google.golang.org/protobuf/proto"
)

func Validate(msg proto.Message) error {
	return protovalidate.Validate(msg)
}
