import datetime

from buf.validate import validate_pb2 as _validate_pb2
from google.api import annotations_pb2 as _annotations_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GatewayLifecycleEventType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    GATEWAY_LIFECYCLE_EVENT_TYPE_UNSPECIFIED: _ClassVar[GatewayLifecycleEventType]
    GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED: _ClassVar[GatewayLifecycleEventType]
    GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_FAILED: _ClassVar[GatewayLifecycleEventType]
    GATEWAY_LIFECYCLE_EVENT_TYPE_SIP_CONNECTED: _ClassVar[GatewayLifecycleEventType]
    GATEWAY_LIFECYCLE_EVENT_TYPE_SIP_ENDED: _ClassVar[GatewayLifecycleEventType]
GATEWAY_LIFECYCLE_EVENT_TYPE_UNSPECIFIED: GatewayLifecycleEventType
GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED: GatewayLifecycleEventType
GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_FAILED: GatewayLifecycleEventType
GATEWAY_LIFECYCLE_EVENT_TYPE_SIP_CONNECTED: GatewayLifecycleEventType
GATEWAY_LIFECYCLE_EVENT_TYPE_SIP_ENDED: GatewayLifecycleEventType

class RecordGatewayEventRequest(_message.Message):
    __slots__ = ("event_id", "event_type", "conversation_id", "session_id", "room_id", "occurred_at", "payload")
    class PayloadEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_FIELD_NUMBER: _ClassVar[int]
    PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    event_id: str
    event_type: GatewayLifecycleEventType
    conversation_id: str
    session_id: str
    room_id: str
    occurred_at: _timestamp_pb2.Timestamp
    payload: _containers.ScalarMap[str, str]
    def __init__(self, event_id: _Optional[str] = ..., event_type: _Optional[_Union[GatewayLifecycleEventType, str]] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., room_id: _Optional[str] = ..., occurred_at: _Optional[_Union[datetime.datetime, _timestamp_pb2.Timestamp, _Mapping]] = ..., payload: _Optional[_Mapping[str, str]] = ...) -> None: ...

class RecordGatewayEventResponse(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...
