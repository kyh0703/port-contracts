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
    __slots__ = ("conversation_id", "session_id", "source", "room_name", "agent_tool_snapshot_id", "stt", "llm", "tts", "mcp_servers", "agent_id", "supervisor_id", "supervisor_version_id", "supervisor_persona", "supervisor_config", "workers", "canvas", "worker_tool_snapshots", "bootstrap_snapshot_id", "api_tool_runtimes")
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
    SUPERVISOR_ID_FIELD_NUMBER: _ClassVar[int]
    SUPERVISOR_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    SUPERVISOR_PERSONA_FIELD_NUMBER: _ClassVar[int]
    SUPERVISOR_CONFIG_FIELD_NUMBER: _ClassVar[int]
    WORKERS_FIELD_NUMBER: _ClassVar[int]
    CANVAS_FIELD_NUMBER: _ClassVar[int]
    WORKER_TOOL_SNAPSHOTS_FIELD_NUMBER: _ClassVar[int]
    BOOTSTRAP_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    API_TOOL_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
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
    supervisor_id: str
    supervisor_version_id: str
    supervisor_persona: SupervisorPersona
    supervisor_config: SupervisorConfig
    workers: _containers.RepeatedCompositeFieldContainer[WorkerSnapshot]
    canvas: CanvasSnapshot
    worker_tool_snapshots: _containers.RepeatedCompositeFieldContainer[WorkerToolSnapshot]
    bootstrap_snapshot_id: str
    api_tool_runtimes: _containers.RepeatedCompositeFieldContainer[ApiToolRuntime]
    def __init__(self, conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., source: _Optional[str] = ..., room_name: _Optional[str] = ..., agent_tool_snapshot_id: _Optional[str] = ..., stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., llm: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., agent_id: _Optional[str] = ..., supervisor_id: _Optional[str] = ..., supervisor_version_id: _Optional[str] = ..., supervisor_persona: _Optional[_Union[SupervisorPersona, _Mapping]] = ..., supervisor_config: _Optional[_Union[SupervisorConfig, _Mapping]] = ..., workers: _Optional[_Iterable[_Union[WorkerSnapshot, _Mapping]]] = ..., canvas: _Optional[_Union[CanvasSnapshot, _Mapping]] = ..., worker_tool_snapshots: _Optional[_Iterable[_Union[WorkerToolSnapshot, _Mapping]]] = ..., bootstrap_snapshot_id: _Optional[str] = ..., api_tool_runtimes: _Optional[_Iterable[_Union[ApiToolRuntime, _Mapping]]] = ...) -> None: ...

class SupervisorPersona(_message.Message):
    __slots__ = ("display_name", "system_prompt", "voice_id", "language")
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    VOICE_ID_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    display_name: str
    system_prompt: str
    voice_id: str
    language: str
    def __init__(self, display_name: _Optional[str] = ..., system_prompt: _Optional[str] = ..., voice_id: _Optional[str] = ..., language: _Optional[str] = ...) -> None: ...

class SupervisorConfig(_message.Message):
    __slots__ = ("routing_instructions", "max_handoff_depth", "global_actions")
    ROUTING_INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    MAX_HANDOFF_DEPTH_FIELD_NUMBER: _ClassVar[int]
    GLOBAL_ACTIONS_FIELD_NUMBER: _ClassVar[int]
    routing_instructions: str
    max_handoff_depth: int
    global_actions: AgentGlobalActions
    def __init__(self, routing_instructions: _Optional[str] = ..., max_handoff_depth: _Optional[int] = ..., global_actions: _Optional[_Union[AgentGlobalActions, _Mapping]] = ...) -> None: ...

class WorkerSnapshot(_message.Message):
    __slots__ = ("worker_id", "version_id", "description", "routing_text", "persona", "role", "runtime_identity", "tool_snapshot_id")
    WORKER_ID_FIELD_NUMBER: _ClassVar[int]
    VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    ROUTING_TEXT_FIELD_NUMBER: _ClassVar[int]
    PERSONA_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    RUNTIME_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    TOOL_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    worker_id: str
    version_id: str
    description: str
    routing_text: str
    persona: WorkerPersona
    role: str
    runtime_identity: str
    tool_snapshot_id: str
    def __init__(self, worker_id: _Optional[str] = ..., version_id: _Optional[str] = ..., description: _Optional[str] = ..., routing_text: _Optional[str] = ..., persona: _Optional[_Union[WorkerPersona, _Mapping]] = ..., role: _Optional[str] = ..., runtime_identity: _Optional[str] = ..., tool_snapshot_id: _Optional[str] = ...) -> None: ...

class WorkerPersona(_message.Message):
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

class CanvasSnapshot(_message.Message):
    __slots__ = ("snapshot_id", "version_id", "schema_version", "nodes")
    SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    SCHEMA_VERSION_FIELD_NUMBER: _ClassVar[int]
    NODES_FIELD_NUMBER: _ClassVar[int]
    snapshot_id: str
    version_id: str
    schema_version: str
    nodes: _containers.RepeatedCompositeFieldContainer[CanvasNodeSnapshot]
    def __init__(self, snapshot_id: _Optional[str] = ..., version_id: _Optional[str] = ..., schema_version: _Optional[str] = ..., nodes: _Optional[_Iterable[_Union[CanvasNodeSnapshot, _Mapping]]] = ...) -> None: ...

class CanvasNodeSnapshot(_message.Message):
    __slots__ = ("node_id", "parent_node_id", "position", "size", "is_entry", "group", "agent")
    NODE_ID_FIELD_NUMBER: _ClassVar[int]
    PARENT_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    POSITION_FIELD_NUMBER: _ClassVar[int]
    SIZE_FIELD_NUMBER: _ClassVar[int]
    IS_ENTRY_FIELD_NUMBER: _ClassVar[int]
    GROUP_FIELD_NUMBER: _ClassVar[int]
    AGENT_FIELD_NUMBER: _ClassVar[int]
    node_id: str
    parent_node_id: str
    position: CanvasPosition
    size: CanvasSize
    is_entry: bool
    group: CanvasGroupPlacement
    agent: CanvasAgentPlacement
    def __init__(self, node_id: _Optional[str] = ..., parent_node_id: _Optional[str] = ..., position: _Optional[_Union[CanvasPosition, _Mapping]] = ..., size: _Optional[_Union[CanvasSize, _Mapping]] = ..., is_entry: _Optional[bool] = ..., group: _Optional[_Union[CanvasGroupPlacement, _Mapping]] = ..., agent: _Optional[_Union[CanvasAgentPlacement, _Mapping]] = ...) -> None: ...

class CanvasGroupPlacement(_message.Message):
    __slots__ = ("label",)
    LABEL_FIELD_NUMBER: _ClassVar[int]
    label: str
    def __init__(self, label: _Optional[str] = ...) -> None: ...

class CanvasAgentPlacement(_message.Message):
    __slots__ = ("agent_id",)
    AGENT_ID_FIELD_NUMBER: _ClassVar[int]
    agent_id: str
    def __init__(self, agent_id: _Optional[str] = ...) -> None: ...

class CanvasPosition(_message.Message):
    __slots__ = ("x", "y")
    X_FIELD_NUMBER: _ClassVar[int]
    Y_FIELD_NUMBER: _ClassVar[int]
    x: float
    y: float
    def __init__(self, x: _Optional[float] = ..., y: _Optional[float] = ...) -> None: ...

class CanvasSize(_message.Message):
    __slots__ = ("width", "height")
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    width: float
    height: float
    def __init__(self, width: _Optional[float] = ..., height: _Optional[float] = ...) -> None: ...

class WorkerToolSnapshot(_message.Message):
    __slots__ = ("snapshot_id", "version_id", "worker_id", "tools")
    SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    WORKER_ID_FIELD_NUMBER: _ClassVar[int]
    TOOLS_FIELD_NUMBER: _ClassVar[int]
    snapshot_id: str
    version_id: str
    worker_id: str
    tools: _containers.RepeatedCompositeFieldContainer[WorkerToolMetadata]
    def __init__(self, snapshot_id: _Optional[str] = ..., version_id: _Optional[str] = ..., worker_id: _Optional[str] = ..., tools: _Optional[_Iterable[_Union[WorkerToolMetadata, _Mapping]]] = ...) -> None: ...

class WorkerToolMetadata(_message.Message):
    __slots__ = ("tool_id", "kind", "name", "description", "mcp", "api")
    TOOL_ID_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    MCP_FIELD_NUMBER: _ClassVar[int]
    API_FIELD_NUMBER: _ClassVar[int]
    tool_id: str
    kind: str
    name: str
    description: str
    mcp: McpToolMetadata
    api: ApiToolMetadata
    def __init__(self, tool_id: _Optional[str] = ..., kind: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., mcp: _Optional[_Union[McpToolMetadata, _Mapping]] = ..., api: _Optional[_Union[ApiToolMetadata, _Mapping]] = ...) -> None: ...

class McpToolMetadata(_message.Message):
    __slots__ = ("server_name", "transport", "url")
    SERVER_NAME_FIELD_NUMBER: _ClassVar[int]
    TRANSPORT_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    server_name: str
    transport: str
    url: str
    def __init__(self, server_name: _Optional[str] = ..., transport: _Optional[str] = ..., url: _Optional[str] = ...) -> None: ...

class ApiToolMetadata(_message.Message):
    __slots__ = ("method", "url", "request_schema_json", "response_schema_json")
    METHOD_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    REQUEST_SCHEMA_JSON_FIELD_NUMBER: _ClassVar[int]
    RESPONSE_SCHEMA_JSON_FIELD_NUMBER: _ClassVar[int]
    method: str
    url: str
    request_schema_json: str
    response_schema_json: str
    def __init__(self, method: _Optional[str] = ..., url: _Optional[str] = ..., request_schema_json: _Optional[str] = ..., response_schema_json: _Optional[str] = ...) -> None: ...

class ApiToolRuntime(_message.Message):
    __slots__ = ("tool_id", "headers")
    class HeadersEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    TOOL_ID_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    tool_id: str
    headers: _containers.ScalarMap[str, str]
    def __init__(self, tool_id: _Optional[str] = ..., headers: _Optional[_Mapping[str, str]] = ...) -> None: ...

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
