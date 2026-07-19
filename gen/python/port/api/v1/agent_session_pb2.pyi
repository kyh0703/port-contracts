from buf.validate import validate_pb2 as _validate_pb2
from port.api.v1 import voice_runtime_pb2 as _voice_runtime_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BootstrapRequest(_message.Message):
    __slots__ = ("webrtc_ticket", "sip")
    WEBRTC_TICKET_FIELD_NUMBER: _ClassVar[int]
    SIP_FIELD_NUMBER: _ClassVar[int]
    webrtc_ticket: str
    sip: SipBootstrapContext
    def __init__(self, webrtc_ticket: _Optional[str] = ..., sip: _Optional[_Union[SipBootstrapContext, _Mapping]] = ...) -> None: ...

class SipBootstrapContext(_message.Message):
    __slots__ = ("job_id", "dispatch_id", "room_name", "participant_identity", "trunk_id", "trunk_phone_number", "call_id_full")
    JOB_ID_FIELD_NUMBER: _ClassVar[int]
    DISPATCH_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    TRUNK_ID_FIELD_NUMBER: _ClassVar[int]
    TRUNK_PHONE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    CALL_ID_FULL_FIELD_NUMBER: _ClassVar[int]
    job_id: str
    dispatch_id: str
    room_name: str
    participant_identity: str
    trunk_id: str
    trunk_phone_number: str
    call_id_full: str
    def __init__(self, job_id: _Optional[str] = ..., dispatch_id: _Optional[str] = ..., room_name: _Optional[str] = ..., participant_identity: _Optional[str] = ..., trunk_id: _Optional[str] = ..., trunk_phone_number: _Optional[str] = ..., call_id_full: _Optional[str] = ...) -> None: ...

class BootstrapResponse(_message.Message):
    __slots__ = ("conversation_id", "session_id", "source", "room_name", "agent_tool_snapshot_id", "stt", "llm", "tts")
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    AGENT_TOOL_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    STT_FIELD_NUMBER: _ClassVar[int]
    LLM_FIELD_NUMBER: _ClassVar[int]
    TTS_FIELD_NUMBER: _ClassVar[int]
    conversation_id: str
    session_id: str
    source: str
    room_name: str
    agent_tool_snapshot_id: str
    stt: _voice_runtime_pb2.SttRuntime
    llm: _voice_runtime_pb2.LlmRuntime
    tts: _voice_runtime_pb2.TtsRuntime
    def __init__(self, conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., source: _Optional[str] = ..., room_name: _Optional[str] = ..., agent_tool_snapshot_id: _Optional[str] = ..., stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., llm: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ...) -> None: ...
