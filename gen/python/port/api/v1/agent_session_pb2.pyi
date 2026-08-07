from buf.validate import validate_pb2 as _validate_pb2
from port.api.v1 import voice_runtime_pb2 as _voice_runtime_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BackgroundAudioPreset(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    BACKGROUND_AUDIO_PRESET_UNSPECIFIED: _ClassVar[BackgroundAudioPreset]
    BACKGROUND_AUDIO_PRESET_NONE: _ClassVar[BackgroundAudioPreset]
    BACKGROUND_AUDIO_PRESET_CAFE: _ClassVar[BackgroundAudioPreset]
    BACKGROUND_AUDIO_PRESET_OFFICE: _ClassVar[BackgroundAudioPreset]
    BACKGROUND_AUDIO_PRESET_CONTACT_CENTER: _ClassVar[BackgroundAudioPreset]
    BACKGROUND_AUDIO_PRESET_LIBRARY: _ClassVar[BackgroundAudioPreset]

class OrchestrationMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    ORCHESTRATION_MODE_UNSPECIFIED: _ClassVar[OrchestrationMode]
    ORCHESTRATION_MODE_SUPERVISOR: _ClassVar[OrchestrationMode]
    ORCHESTRATION_MODE_HANDOFF: _ClassVar[OrchestrationMode]

class NodeKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    NODE_KIND_UNSPECIFIED: _ClassVar[NodeKind]
    NODE_KIND_AGENT: _ClassVar[NodeKind]
    NODE_KIND_TASK: _ClassVar[NodeKind]
    NODE_KIND_GROUP: _ClassVar[NodeKind]

class TransitionKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    TRANSITION_KIND_UNSPECIFIED: _ClassVar[TransitionKind]
    TRANSITION_KIND_DELEGATE: _ClassVar[TransitionKind]
    TRANSITION_KIND_HANDOFF: _ClassVar[TransitionKind]

class ContextPolicy(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CONTEXT_POLICY_UNSPECIFIED: _ClassVar[ContextPolicy]
    CONTEXT_POLICY_NONE: _ClassVar[ContextPolicy]
    CONTEXT_POLICY_CONVERSATION: _ClassVar[ContextPolicy]
BACKGROUND_AUDIO_PRESET_UNSPECIFIED: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_NONE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_CAFE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_OFFICE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_CONTACT_CENTER: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_LIBRARY: BackgroundAudioPreset
ORCHESTRATION_MODE_UNSPECIFIED: OrchestrationMode
ORCHESTRATION_MODE_SUPERVISOR: OrchestrationMode
ORCHESTRATION_MODE_HANDOFF: OrchestrationMode
NODE_KIND_UNSPECIFIED: NodeKind
NODE_KIND_AGENT: NodeKind
NODE_KIND_TASK: NodeKind
NODE_KIND_GROUP: NodeKind
TRANSITION_KIND_UNSPECIFIED: TransitionKind
TRANSITION_KIND_DELEGATE: TransitionKind
TRANSITION_KIND_HANDOFF: TransitionKind
CONTEXT_POLICY_UNSPECIFIED: ContextPolicy
CONTEXT_POLICY_NONE: ContextPolicy
CONTEXT_POLICY_CONVERSATION: ContextPolicy

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
    __slots__ = ("conversation_id", "session_id", "source", "room_name", "agent_tool_snapshot_id", "stt", "llm", "tts", "mcp_servers", "agent_id", "supervisor_id", "supervisor_version_id", "supervisor_persona", "supervisor_config", "workers", "canvas", "worker_tool_snapshots", "bootstrap_snapshot_id", "api_tool_runtimes", "orchestration_graph")
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
    ORCHESTRATION_GRAPH_FIELD_NUMBER: _ClassVar[int]
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
    orchestration_graph: OrchestrationGraphSnapshot
    def __init__(self, conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., source: _Optional[str] = ..., room_name: _Optional[str] = ..., agent_tool_snapshot_id: _Optional[str] = ..., stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., llm: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., agent_id: _Optional[str] = ..., supervisor_id: _Optional[str] = ..., supervisor_version_id: _Optional[str] = ..., supervisor_persona: _Optional[_Union[SupervisorPersona, _Mapping]] = ..., supervisor_config: _Optional[_Union[SupervisorConfig, _Mapping]] = ..., workers: _Optional[_Iterable[_Union[WorkerSnapshot, _Mapping]]] = ..., canvas: _Optional[_Union[CanvasSnapshot, _Mapping]] = ..., worker_tool_snapshots: _Optional[_Iterable[_Union[WorkerToolSnapshot, _Mapping]]] = ..., bootstrap_snapshot_id: _Optional[str] = ..., api_tool_runtimes: _Optional[_Iterable[_Union[ApiToolRuntime, _Mapping]]] = ..., orchestration_graph: _Optional[_Union[OrchestrationGraphSnapshot, _Mapping]] = ...) -> None: ...

class BootstrapAgentRequest(_message.Message):
    __slots__ = ("admission", "conversation_id", "session_id", "agent_version_id", "contract_revision")
    ADMISSION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    admission: BootstrapRequest
    conversation_id: str
    session_id: str
    agent_version_id: str
    contract_revision: str
    def __init__(self, admission: _Optional[_Union[BootstrapRequest, _Mapping]] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., agent_version_id: _Optional[str] = ..., contract_revision: _Optional[str] = ...) -> None: ...

class BootstrapAgentResponse(_message.Message):
    __slots__ = ("contract_revision", "schema_version", "conversation_id", "session_id", "call_runtime", "agent_runtime")
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    SCHEMA_VERSION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    CALL_RUNTIME_FIELD_NUMBER: _ClassVar[int]
    AGENT_RUNTIME_FIELD_NUMBER: _ClassVar[int]
    contract_revision: str
    schema_version: str
    conversation_id: str
    session_id: str
    call_runtime: CallRuntimeSnapshot
    agent_runtime: AgentRuntime
    def __init__(self, contract_revision: _Optional[str] = ..., schema_version: _Optional[str] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., call_runtime: _Optional[_Union[CallRuntimeSnapshot, _Mapping]] = ..., agent_runtime: _Optional[_Union[AgentRuntime, _Mapping]] = ...) -> None: ...

class BootstrapOrchestrationRequest(_message.Message):
    __slots__ = ("admission", "conversation_id", "session_id", "orchestration_version_id", "contract_revision")
    ADMISSION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    ORCHESTRATION_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    admission: BootstrapRequest
    conversation_id: str
    session_id: str
    orchestration_version_id: str
    contract_revision: str
    def __init__(self, admission: _Optional[_Union[BootstrapRequest, _Mapping]] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., orchestration_version_id: _Optional[str] = ..., contract_revision: _Optional[str] = ...) -> None: ...

class BootstrapOrchestrationResponse(_message.Message):
    __slots__ = ("contract_revision", "schema_version", "conversation_id", "session_id", "orchestration_id", "orchestration_version_id", "mode", "call_runtime", "agent_runtimes", "supervisor", "handoff")
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    SCHEMA_VERSION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    ORCHESTRATION_ID_FIELD_NUMBER: _ClassVar[int]
    ORCHESTRATION_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    MODE_FIELD_NUMBER: _ClassVar[int]
    CALL_RUNTIME_FIELD_NUMBER: _ClassVar[int]
    AGENT_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    SUPERVISOR_FIELD_NUMBER: _ClassVar[int]
    HANDOFF_FIELD_NUMBER: _ClassVar[int]
    contract_revision: str
    schema_version: str
    conversation_id: str
    session_id: str
    orchestration_id: str
    orchestration_version_id: str
    mode: OrchestrationMode
    call_runtime: CallRuntimeSnapshot
    agent_runtimes: _containers.RepeatedCompositeFieldContainer[AgentRuntime]
    supervisor: SupervisorSnapshot
    handoff: HandoffSnapshot
    def __init__(self, contract_revision: _Optional[str] = ..., schema_version: _Optional[str] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., orchestration_id: _Optional[str] = ..., orchestration_version_id: _Optional[str] = ..., mode: _Optional[_Union[OrchestrationMode, str]] = ..., call_runtime: _Optional[_Union[CallRuntimeSnapshot, _Mapping]] = ..., agent_runtimes: _Optional[_Iterable[_Union[AgentRuntime, _Mapping]]] = ..., supervisor: _Optional[_Union[SupervisorSnapshot, _Mapping]] = ..., handoff: _Optional[_Union[HandoffSnapshot, _Mapping]] = ...) -> None: ...

class CallRuntimeSnapshot(_message.Message):
    __slots__ = ("stt", "tts", "background_audio", "dtmf")
    STT_FIELD_NUMBER: _ClassVar[int]
    TTS_FIELD_NUMBER: _ClassVar[int]
    BACKGROUND_AUDIO_FIELD_NUMBER: _ClassVar[int]
    DTMF_FIELD_NUMBER: _ClassVar[int]
    stt: _voice_runtime_pb2.SttRuntime
    tts: _voice_runtime_pb2.TtsRuntime
    background_audio: BackgroundAudioRuntime
    dtmf: DtmfInputRuntime
    def __init__(self, stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ..., background_audio: _Optional[_Union[BackgroundAudioRuntime, _Mapping]] = ..., dtmf: _Optional[_Union[DtmfInputRuntime, _Mapping]] = ...) -> None: ...

class BackgroundAudioRuntime(_message.Message):
    __slots__ = ("preset", "volume")
    PRESET_FIELD_NUMBER: _ClassVar[int]
    VOLUME_FIELD_NUMBER: _ClassVar[int]
    preset: BackgroundAudioPreset
    volume: float
    def __init__(self, preset: _Optional[_Union[BackgroundAudioPreset, str]] = ..., volume: _Optional[float] = ...) -> None: ...

class DtmfInputRuntime(_message.Message):
    __slots__ = ("timeout_seconds", "end_key")
    TIMEOUT_SECONDS_FIELD_NUMBER: _ClassVar[int]
    END_KEY_FIELD_NUMBER: _ClassVar[int]
    timeout_seconds: int
    end_key: str
    def __init__(self, timeout_seconds: _Optional[int] = ..., end_key: _Optional[str] = ...) -> None: ...

class AgentRuntime(_message.Message):
    __slots__ = ("agent_id", "agent_version_id", "llm_worker", "instructions", "context_policy", "tools", "mcp_servers", "greeting", "knowledge_revision_id")
    AGENT_ID_FIELD_NUMBER: _ClassVar[int]
    AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    LLM_WORKER_FIELD_NUMBER: _ClassVar[int]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    TOOLS_FIELD_NUMBER: _ClassVar[int]
    MCP_SERVERS_FIELD_NUMBER: _ClassVar[int]
    GREETING_FIELD_NUMBER: _ClassVar[int]
    KNOWLEDGE_REVISION_ID_FIELD_NUMBER: _ClassVar[int]
    agent_id: str
    agent_version_id: str
    llm_worker: _voice_runtime_pb2.LlmRuntime
    instructions: AgentInstructions
    context_policy: ContextPolicy
    tools: _containers.RepeatedCompositeFieldContainer[NodeToolMetadata]
    mcp_servers: _containers.RepeatedCompositeFieldContainer[McpServerRuntime]
    greeting: str
    knowledge_revision_id: str
    def __init__(self, agent_id: _Optional[str] = ..., agent_version_id: _Optional[str] = ..., llm_worker: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., instructions: _Optional[_Union[AgentInstructions, _Mapping]] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., tools: _Optional[_Iterable[_Union[NodeToolMetadata, _Mapping]]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., greeting: _Optional[str] = ..., knowledge_revision_id: _Optional[str] = ...) -> None: ...

class AgentInstructions(_message.Message):
    __slots__ = ("system_prompt", "guardrails")
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    GUARDRAILS_FIELD_NUMBER: _ClassVar[int]
    system_prompt: str
    guardrails: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, system_prompt: _Optional[str] = ..., guardrails: _Optional[_Iterable[str]] = ...) -> None: ...

class SupervisorSnapshot(_message.Message):
    __slots__ = ("supervisor_agent_version_id", "specialists")
    SUPERVISOR_AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    SPECIALISTS_FIELD_NUMBER: _ClassVar[int]
    supervisor_agent_version_id: str
    specialists: _containers.RepeatedCompositeFieldContainer[SupervisorSpecialist]
    def __init__(self, supervisor_agent_version_id: _Optional[str] = ..., specialists: _Optional[_Iterable[_Union[SupervisorSpecialist, _Mapping]]] = ...) -> None: ...

class SupervisorSpecialist(_message.Message):
    __slots__ = ("relation_id", "target_agent_version_id", "route_description", "context_policy")
    RELATION_ID_FIELD_NUMBER: _ClassVar[int]
    TARGET_AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    ROUTE_DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    relation_id: str
    target_agent_version_id: str
    route_description: str
    context_policy: ContextPolicy
    def __init__(self, relation_id: _Optional[str] = ..., target_agent_version_id: _Optional[str] = ..., route_description: _Optional[str] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ...) -> None: ...

class HandoffSnapshot(_message.Message):
    __slots__ = ("entry_agent_version_id", "max_handoff_depth", "routes")
    ENTRY_AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    MAX_HANDOFF_DEPTH_FIELD_NUMBER: _ClassVar[int]
    ROUTES_FIELD_NUMBER: _ClassVar[int]
    entry_agent_version_id: str
    max_handoff_depth: int
    routes: _containers.RepeatedCompositeFieldContainer[HandoffRoute]
    def __init__(self, entry_agent_version_id: _Optional[str] = ..., max_handoff_depth: _Optional[int] = ..., routes: _Optional[_Iterable[_Union[HandoffRoute, _Mapping]]] = ...) -> None: ...

class HandoffRoute(_message.Message):
    __slots__ = ("transition_id", "source_agent_version_id", "target_agent_version_id", "routing_description", "context_policy", "announcement")
    TRANSITION_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    TARGET_AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    ROUTING_DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    ANNOUNCEMENT_FIELD_NUMBER: _ClassVar[int]
    transition_id: str
    source_agent_version_id: str
    target_agent_version_id: str
    routing_description: str
    context_policy: ContextPolicy
    announcement: str
    def __init__(self, transition_id: _Optional[str] = ..., source_agent_version_id: _Optional[str] = ..., target_agent_version_id: _Optional[str] = ..., routing_description: _Optional[str] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., announcement: _Optional[str] = ...) -> None: ...

class OrchestrationGraphSnapshot(_message.Message):
    __slots__ = ("snapshot_id", "version_id", "schema_version", "entry_node_id", "max_handoff_depth", "nodes", "transitions", "node_tool_snapshots")
    SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    SCHEMA_VERSION_FIELD_NUMBER: _ClassVar[int]
    ENTRY_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    MAX_HANDOFF_DEPTH_FIELD_NUMBER: _ClassVar[int]
    NODES_FIELD_NUMBER: _ClassVar[int]
    TRANSITIONS_FIELD_NUMBER: _ClassVar[int]
    NODE_TOOL_SNAPSHOTS_FIELD_NUMBER: _ClassVar[int]
    snapshot_id: str
    version_id: str
    schema_version: str
    entry_node_id: str
    max_handoff_depth: int
    nodes: _containers.RepeatedCompositeFieldContainer[OrchestrationNode]
    transitions: _containers.RepeatedCompositeFieldContainer[OrchestrationTransition]
    node_tool_snapshots: _containers.RepeatedCompositeFieldContainer[NodeToolSnapshot]
    def __init__(self, snapshot_id: _Optional[str] = ..., version_id: _Optional[str] = ..., schema_version: _Optional[str] = ..., entry_node_id: _Optional[str] = ..., max_handoff_depth: _Optional[int] = ..., nodes: _Optional[_Iterable[_Union[OrchestrationNode, _Mapping]]] = ..., transitions: _Optional[_Iterable[_Union[OrchestrationTransition, _Mapping]]] = ..., node_tool_snapshots: _Optional[_Iterable[_Union[NodeToolSnapshot, _Mapping]]] = ...) -> None: ...

class OrchestrationNode(_message.Message):
    __slots__ = ("node_id", "kind", "parent_node_id", "position", "size", "agent", "task", "group")
    NODE_ID_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    PARENT_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    POSITION_FIELD_NUMBER: _ClassVar[int]
    SIZE_FIELD_NUMBER: _ClassVar[int]
    AGENT_FIELD_NUMBER: _ClassVar[int]
    TASK_FIELD_NUMBER: _ClassVar[int]
    GROUP_FIELD_NUMBER: _ClassVar[int]
    node_id: str
    kind: NodeKind
    parent_node_id: str
    position: CanvasPosition
    size: CanvasSize
    agent: OrchestrationAgent
    task: OrchestrationTask
    group: OrchestrationGroup
    def __init__(self, node_id: _Optional[str] = ..., kind: _Optional[_Union[NodeKind, str]] = ..., parent_node_id: _Optional[str] = ..., position: _Optional[_Union[CanvasPosition, _Mapping]] = ..., size: _Optional[_Union[CanvasSize, _Mapping]] = ..., agent: _Optional[_Union[OrchestrationAgent, _Mapping]] = ..., task: _Optional[_Union[OrchestrationTask, _Mapping]] = ..., group: _Optional[_Union[OrchestrationGroup, _Mapping]] = ...) -> None: ...

class OrchestrationAgent(_message.Message):
    __slots__ = ("agent_id", "agent_version_id", "persona", "execution_profile", "tool_snapshot_id")
    AGENT_ID_FIELD_NUMBER: _ClassVar[int]
    AGENT_VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    PERSONA_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_PROFILE_FIELD_NUMBER: _ClassVar[int]
    TOOL_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    agent_id: str
    agent_version_id: str
    persona: OrchestrationAgentPersona
    execution_profile: OrchestrationExecutionProfile
    tool_snapshot_id: str
    def __init__(self, agent_id: _Optional[str] = ..., agent_version_id: _Optional[str] = ..., persona: _Optional[_Union[OrchestrationAgentPersona, _Mapping]] = ..., execution_profile: _Optional[_Union[OrchestrationExecutionProfile, _Mapping]] = ..., tool_snapshot_id: _Optional[str] = ...) -> None: ...

class OrchestrationTask(_message.Message):
    __slots__ = ("name", "instructions", "completion_instructions", "execution_profile", "tool_snapshot_id")
    NAME_FIELD_NUMBER: _ClassVar[int]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    COMPLETION_INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_PROFILE_FIELD_NUMBER: _ClassVar[int]
    TOOL_SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    name: str
    instructions: str
    completion_instructions: str
    execution_profile: OrchestrationExecutionProfile
    tool_snapshot_id: str
    def __init__(self, name: _Optional[str] = ..., instructions: _Optional[str] = ..., completion_instructions: _Optional[str] = ..., execution_profile: _Optional[_Union[OrchestrationExecutionProfile, _Mapping]] = ..., tool_snapshot_id: _Optional[str] = ...) -> None: ...

class OrchestrationGroup(_message.Message):
    __slots__ = ("label",)
    LABEL_FIELD_NUMBER: _ClassVar[int]
    label: str
    def __init__(self, label: _Optional[str] = ...) -> None: ...

class OrchestrationAgentPersona(_message.Message):
    __slots__ = ("display_name", "system_prompt", "greeting")
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    GREETING_FIELD_NUMBER: _ClassVar[int]
    display_name: str
    system_prompt: str
    greeting: str
    def __init__(self, display_name: _Optional[str] = ..., system_prompt: _Optional[str] = ..., greeting: _Optional[str] = ...) -> None: ...

class OrchestrationExecutionProfile(_message.Message):
    __slots__ = ("llm_model", "tts_model", "voice_id", "language")
    LLM_MODEL_FIELD_NUMBER: _ClassVar[int]
    TTS_MODEL_FIELD_NUMBER: _ClassVar[int]
    VOICE_ID_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    llm_model: str
    tts_model: str
    voice_id: str
    language: str
    def __init__(self, llm_model: _Optional[str] = ..., tts_model: _Optional[str] = ..., voice_id: _Optional[str] = ..., language: _Optional[str] = ...) -> None: ...

class NodeToolSnapshot(_message.Message):
    __slots__ = ("snapshot_id", "version_id", "node_id", "tools")
    SNAPSHOT_ID_FIELD_NUMBER: _ClassVar[int]
    VERSION_ID_FIELD_NUMBER: _ClassVar[int]
    NODE_ID_FIELD_NUMBER: _ClassVar[int]
    TOOLS_FIELD_NUMBER: _ClassVar[int]
    snapshot_id: str
    version_id: str
    node_id: str
    tools: _containers.RepeatedCompositeFieldContainer[NodeToolMetadata]
    def __init__(self, snapshot_id: _Optional[str] = ..., version_id: _Optional[str] = ..., node_id: _Optional[str] = ..., tools: _Optional[_Iterable[_Union[NodeToolMetadata, _Mapping]]] = ...) -> None: ...

class NodeToolMetadata(_message.Message):
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

class OrchestrationTransition(_message.Message):
    __slots__ = ("transition_id", "source_node_id", "target_node_id", "kind", "description", "context_policy", "announcement")
    TRANSITION_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    TARGET_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    ANNOUNCEMENT_FIELD_NUMBER: _ClassVar[int]
    transition_id: str
    source_node_id: str
    target_node_id: str
    kind: TransitionKind
    description: str
    context_policy: ContextPolicy
    announcement: str
    def __init__(self, transition_id: _Optional[str] = ..., source_node_id: _Optional[str] = ..., target_node_id: _Optional[str] = ..., kind: _Optional[_Union[TransitionKind, str]] = ..., description: _Optional[str] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., announcement: _Optional[str] = ...) -> None: ...

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
