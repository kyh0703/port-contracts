from buf.validate import validate_pb2 as _validate_pb2
from port.api.v1 import voice_runtime_pb2 as _voice_runtime_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
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
    __slots__ = ("conversation_id", "session_id", "source", "room_name", "agent_tool_snapshot_id", "stt", "llm", "tts", "mcp_servers", "agent_id", "persona", "specialists", "global_actions", "agent_version_id")
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    AGENT_TOOL_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    STT_FIELD_NUMBER: _ClassVar[int]
    LLM_FIELD_NUMBER: _ClassVar[int]
    TTS_FIELD_NUMBER: _ClassVar[int]
    MCP_SERVERS_FIELD_NUMBER: _ClassVar[int]
    AGENT_ID_FIELD_NUMBER: _ClassVar[int]
    PERSONA_FIELD_NUMBER: _ClassVar[int]
    SPECIALISTS_FIELD_NUMBER: _ClassVar[int]
    GLOBAL_ACTIONS_FIELD_NUMBER: _ClassVar[int]
    AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    conversation_id: str
    session_id: str
    source: str
    room_name: str
    agent_tool_snapshot_id: str
    stt: _voice_runtime_pb2.SttRuntime
    llm: _voice_runtime_pb2.LlmRuntime
    tts: _voice_runtime_pb2.TtsRuntime
    mcp_servers: _containers.RepeatedCompositeFieldContainer[McpServerRuntime]
    agent_id: str
    persona: AgentPersona
    specialists: _containers.RepeatedCompositeFieldContainer[AgentSpecialist]
    global_actions: AgentGlobalActions
    agent_version_id: str
    def __init__(self, conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., source: _Optional[str] = ..., room_name: _Optional[str] = ..., agent_tool_snapshot_id: _Optional[str] = ..., stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., llm: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., agent_id: _Optional[str] = ..., persona: _Optional[_Union[AgentPersona, _Mapping]] = ..., specialists: _Optional[_Iterable[_Union[AgentSpecialist, _Mapping]]] = ..., global_actions: _Optional[_Union[AgentGlobalActions, _Mapping]] = ..., agent_version_id: _Optional[str] = ...) -> None: ...

class AgentSpecialist(_message.Message):
    __slots__ = ("specialist_id", "key", "display_name", "when_to_use", "instructions", "completion_fields", "failure_policy")
    SPECIALIST_ID_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    WHEN_TO_USE_FIELD_NUMBER: _ClassVar[int]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    COMPLETION_FIELDS_FIELD_NUMBER: _ClassVar[int]
    FAILURE_POLICY_FIELD_NUMBER: _ClassVar[int]
    specialist_id: str
    key: str
    display_name: str
    when_to_use: str
    instructions: str
    completion_fields: _containers.RepeatedCompositeFieldContainer[CompletionField]
    failure_policy: SpecialistFailurePolicy
    def __init__(self, specialist_id: _Optional[str] = ..., key: _Optional[str] = ..., display_name: _Optional[str] = ..., when_to_use: _Optional[str] = ..., instructions: _Optional[str] = ..., completion_fields: _Optional[_Iterable[_Union[CompletionField, _Mapping]]] = ..., failure_policy: _Optional[_Union[SpecialistFailurePolicy, _Mapping]] = ...) -> None: ...

class CompletionField(_message.Message):
    __slots__ = ("name", "type", "description", "required", "pattern")
    NAME_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    REQUIRED_FIELD_NUMBER: _ClassVar[int]
    PATTERN_FIELD_NUMBER: _ClassVar[int]
    name: str
    type: str
    description: str
    required: bool
    pattern: str
    def __init__(self, name: _Optional[str] = ..., type: _Optional[str] = ..., description: _Optional[str] = ..., required: _Optional[bool] = ..., pattern: _Optional[str] = ...) -> None: ...

class SpecialistFailurePolicy(_message.Message):
    __slots__ = ("max_attempts", "timeout_ms", "on_failure")
    MAX_ATTEMPTS_FIELD_NUMBER: _ClassVar[int]
    TIMEOUT_MS_FIELD_NUMBER: _ClassVar[int]
    ON_FAILURE_FIELD_NUMBER: _ClassVar[int]
    max_attempts: int
    timeout_ms: int
    on_failure: str
    def __init__(self, max_attempts: _Optional[int] = ..., timeout_ms: _Optional[int] = ..., on_failure: _Optional[str] = ...) -> None: ...

class AgentGlobalActions(_message.Message):
    __slots__ = ("transfer_to_human", "end_call")
    TRANSFER_TO_HUMAN_FIELD_NUMBER: _ClassVar[int]
    END_CALL_FIELD_NUMBER: _ClassVar[int]
    transfer_to_human: TransferToHumanAction
    end_call: EndCallAction
    def __init__(self, transfer_to_human: _Optional[_Union[TransferToHumanAction, _Mapping]] = ..., end_call: _Optional[_Union[EndCallAction, _Mapping]] = ...) -> None: ...

class TransferToHumanAction(_message.Message):
    __slots__ = ("enabled", "sip_call_to", "hold_phrase", "ringing_timeout_ms")
    ENABLED_FIELD_NUMBER: _ClassVar[int]
    SIP_CALL_TO_FIELD_NUMBER: _ClassVar[int]
    HOLD_PHRASE_FIELD_NUMBER: _ClassVar[int]
    RINGING_TIMEOUT_MS_FIELD_NUMBER: _ClassVar[int]
    enabled: bool
    sip_call_to: str
    hold_phrase: str
    ringing_timeout_ms: int
    def __init__(self, enabled: _Optional[bool] = ..., sip_call_to: _Optional[str] = ..., hold_phrase: _Optional[str] = ..., ringing_timeout_ms: _Optional[int] = ...) -> None: ...

class EndCallAction(_message.Message):
    __slots__ = ("enabled", "closing_phrase", "confirm")
    ENABLED_FIELD_NUMBER: _ClassVar[int]
    CLOSING_PHRASE_FIELD_NUMBER: _ClassVar[int]
    CONFIRM_FIELD_NUMBER: _ClassVar[int]
    enabled: bool
    closing_phrase: str
    confirm: bool
    def __init__(self, enabled: _Optional[bool] = ..., closing_phrase: _Optional[str] = ..., confirm: _Optional[bool] = ...) -> None: ...

class AgentPersona(_message.Message):
    __slots__ = ("display_name", "system_prompt", "greeting", "voice_id", "language")
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    GREETING_FIELD_NUMBER: _ClassVar[int]
    VOICE_ID_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    display_name: str
    system_prompt: str
    greeting: str
    voice_id: str
    language: str
    def __init__(self, display_name: _Optional[str] = ..., system_prompt: _Optional[str] = ..., greeting: _Optional[str] = ..., voice_id: _Optional[str] = ..., language: _Optional[str] = ...) -> None: ...

class McpServerRuntime(_message.Message):
    __slots__ = ("name", "transport", "url", "headers")
    class HeadersEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    NAME_FIELD_NUMBER: _ClassVar[int]
    TRANSPORT_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    name: str
    transport: str
    url: str
    headers: _containers.ScalarMap[str, str]
    def __init__(self, name: _Optional[str] = ..., transport: _Optional[str] = ..., url: _Optional[str] = ..., headers: _Optional[_Mapping[str, str]] = ...) -> None: ...
