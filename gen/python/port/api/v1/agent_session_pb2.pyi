from buf.validate import validate_pb2 as _validate_pb2
from port.api.v1 import voice_runtime_pb2 as _voice_runtime_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class HandoffParameterType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    HANDOFF_PARAMETER_TYPE_UNSPECIFIED: _ClassVar[HandoffParameterType]
    HANDOFF_PARAMETER_TYPE_STRING: _ClassVar[HandoffParameterType]
    HANDOFF_PARAMETER_TYPE_NUMBER: _ClassVar[HandoffParameterType]
    HANDOFF_PARAMETER_TYPE_BOOLEAN: _ClassVar[HandoffParameterType]

class CallTransportSource(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CALL_TRANSPORT_SOURCE_UNSPECIFIED: _ClassVar[CallTransportSource]
    CALL_TRANSPORT_SOURCE_WEBRTC: _ClassVar[CallTransportSource]
    CALL_TRANSPORT_SOURCE_SIP: _ClassVar[CallTransportSource]
    CALL_TRANSPORT_SOURCE_TEXT_STREAM: _ClassVar[CallTransportSource]

class NoiseCancellationMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    NOISE_CANCELLATION_MODE_UNSPECIFIED: _ClassVar[NoiseCancellationMode]
    NOISE_CANCELLATION_MODE_OFF: _ClassVar[NoiseCancellationMode]
    NOISE_CANCELLATION_MODE_STANDARD: _ClassVar[NoiseCancellationMode]
    NOISE_CANCELLATION_MODE_STRONG: _ClassVar[NoiseCancellationMode]

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

class ContextPolicy(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CONTEXT_POLICY_UNSPECIFIED: _ClassVar[ContextPolicy]
    CONTEXT_POLICY_NONE: _ClassVar[ContextPolicy]
    CONTEXT_POLICY_CONVERSATION: _ClassVar[ContextPolicy]
    CONTEXT_POLICY_RECENT: _ClassVar[ContextPolicy]
HANDOFF_PARAMETER_TYPE_UNSPECIFIED: HandoffParameterType
HANDOFF_PARAMETER_TYPE_STRING: HandoffParameterType
HANDOFF_PARAMETER_TYPE_NUMBER: HandoffParameterType
HANDOFF_PARAMETER_TYPE_BOOLEAN: HandoffParameterType
CALL_TRANSPORT_SOURCE_UNSPECIFIED: CallTransportSource
CALL_TRANSPORT_SOURCE_WEBRTC: CallTransportSource
CALL_TRANSPORT_SOURCE_SIP: CallTransportSource
CALL_TRANSPORT_SOURCE_TEXT_STREAM: CallTransportSource
NOISE_CANCELLATION_MODE_UNSPECIFIED: NoiseCancellationMode
NOISE_CANCELLATION_MODE_OFF: NoiseCancellationMode
NOISE_CANCELLATION_MODE_STANDARD: NoiseCancellationMode
NOISE_CANCELLATION_MODE_STRONG: NoiseCancellationMode
BACKGROUND_AUDIO_PRESET_UNSPECIFIED: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_NONE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_CAFE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_OFFICE: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_CONTACT_CENTER: BackgroundAudioPreset
BACKGROUND_AUDIO_PRESET_LIBRARY: BackgroundAudioPreset
ORCHESTRATION_MODE_UNSPECIFIED: OrchestrationMode
ORCHESTRATION_MODE_SUPERVISOR: OrchestrationMode
ORCHESTRATION_MODE_HANDOFF: OrchestrationMode
CONTEXT_POLICY_UNSPECIFIED: ContextPolicy
CONTEXT_POLICY_NONE: ContextPolicy
CONTEXT_POLICY_CONVERSATION: ContextPolicy
CONTEXT_POLICY_RECENT: ContextPolicy

class BootstrapRequest(_message.Message):
    __slots__ = ("webrtc_ticket", "sip")
    WEBRTC_TICKET_FIELD_NUMBER: _ClassVar[int]
    SIP_FIELD_NUMBER: _ClassVar[int]
    webrtc_ticket: str
    sip: SipBootstrapContext
    def __init__(self, webrtc_ticket: _Optional[str] = ..., sip: _Optional[_Union[SipBootstrapContext, _Mapping]] = ...) -> None: ...

class SipBootstrapContext(_message.Message):
    __slots__ = ("job_id", "dispatch_id", "room_name", "participant_identity", "trunk_id", "trunk_phone_number", "call_id_full", "phone_number")
    JOB_ID_FIELD_NUMBER: _ClassVar[int]
    DISPATCH_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    TRUNK_ID_FIELD_NUMBER: _ClassVar[int]
    TRUNK_PHONE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    CALL_ID_FULL_FIELD_NUMBER: _ClassVar[int]
    PHONE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    job_id: str
    dispatch_id: str
    room_name: str
    participant_identity: str
    trunk_id: str
    trunk_phone_number: str
    call_id_full: str
    phone_number: str
    def __init__(self, job_id: _Optional[str] = ..., dispatch_id: _Optional[str] = ..., room_name: _Optional[str] = ..., participant_identity: _Optional[str] = ..., trunk_id: _Optional[str] = ..., trunk_phone_number: _Optional[str] = ..., call_id_full: _Optional[str] = ..., phone_number: _Optional[str] = ...) -> None: ...

class BootstrapPublishedRequest(_message.Message):
    __slots__ = ("admission", "conversation_id", "session_id", "published_id", "contract_revision")
    ADMISSION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_ID_FIELD_NUMBER: _ClassVar[int]
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    admission: BootstrapRequest
    conversation_id: str
    session_id: str
    published_id: str
    contract_revision: str
    def __init__(self, admission: _Optional[_Union[BootstrapRequest, _Mapping]] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., published_id: _Optional[str] = ..., contract_revision: _Optional[str] = ...) -> None: ...

class BootstrapPublishedResponse(_message.Message):
    __slots__ = ("contract_revision", "conversation_id", "session_id", "published_id", "prompt_agent", "orchestration", "voice_runtime", "text_runtime")
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_ID_FIELD_NUMBER: _ClassVar[int]
    PROMPT_AGENT_FIELD_NUMBER: _ClassVar[int]
    ORCHESTRATION_FIELD_NUMBER: _ClassVar[int]
    VOICE_RUNTIME_FIELD_NUMBER: _ClassVar[int]
    TEXT_RUNTIME_FIELD_NUMBER: _ClassVar[int]
    contract_revision: str
    conversation_id: str
    session_id: str
    published_id: str
    prompt_agent: PublishedPromptAgentExecution
    orchestration: PublishedOrchestrationExecution
    voice_runtime: CallRuntimeSnapshot
    text_runtime: TextRuntimeSnapshot
    def __init__(self, contract_revision: _Optional[str] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., published_id: _Optional[str] = ..., prompt_agent: _Optional[_Union[PublishedPromptAgentExecution, _Mapping]] = ..., orchestration: _Optional[_Union[PublishedOrchestrationExecution, _Mapping]] = ..., voice_runtime: _Optional[_Union[CallRuntimeSnapshot, _Mapping]] = ..., text_runtime: _Optional[_Union[TextRuntimeSnapshot, _Mapping]] = ...) -> None: ...

class PublishedPromptAgentExecution(_message.Message):
    __slots__ = ("runtime",)
    RUNTIME_FIELD_NUMBER: _ClassVar[int]
    runtime: PublishedPromptAgentRuntime
    def __init__(self, runtime: _Optional[_Union[PublishedPromptAgentRuntime, _Mapping]] = ...) -> None: ...

class PublishedOrchestrationExecution(_message.Message):
    __slots__ = ("mode", "node_runtimes", "supervisor", "handoff")
    MODE_FIELD_NUMBER: _ClassVar[int]
    NODE_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    SUPERVISOR_FIELD_NUMBER: _ClassVar[int]
    HANDOFF_FIELD_NUMBER: _ClassVar[int]
    mode: OrchestrationMode
    node_runtimes: _containers.RepeatedCompositeFieldContainer[PublishedInlinePromptRuntime]
    supervisor: PublishedSupervisorSnapshot
    handoff: PublishedHandoffSnapshot
    def __init__(self, mode: _Optional[_Union[OrchestrationMode, str]] = ..., node_runtimes: _Optional[_Iterable[_Union[PublishedInlinePromptRuntime, _Mapping]]] = ..., supervisor: _Optional[_Union[PublishedSupervisorSnapshot, _Mapping]] = ..., handoff: _Optional[_Union[PublishedHandoffSnapshot, _Mapping]] = ...) -> None: ...

class PublishedPromptAgentRuntime(_message.Message):
    __slots__ = ("prompt_agent_published_id", "llm_worker", "instructions", "context_policy", "tools", "mcp_servers", "greeting", "knowledge_revision_id", "api_tool_runtimes", "knowledge_retrieval_capability", "a2a_tool_runtimes", "built_in_tools")
    PROMPT_AGENT_PUBLISHED_ID_FIELD_NUMBER: _ClassVar[int]
    LLM_WORKER_FIELD_NUMBER: _ClassVar[int]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    TOOLS_FIELD_NUMBER: _ClassVar[int]
    MCP_SERVERS_FIELD_NUMBER: _ClassVar[int]
    GREETING_FIELD_NUMBER: _ClassVar[int]
    KNOWLEDGE_REVISION_ID_FIELD_NUMBER: _ClassVar[int]
    API_TOOL_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    KNOWLEDGE_RETRIEVAL_CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    A2A_TOOL_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    BUILT_IN_TOOLS_FIELD_NUMBER: _ClassVar[int]
    prompt_agent_published_id: str
    llm_worker: _voice_runtime_pb2.LlmRuntime
    instructions: PromptInstructions
    context_policy: ContextPolicy
    tools: _containers.RepeatedCompositeFieldContainer[NodeToolMetadata]
    mcp_servers: _containers.RepeatedCompositeFieldContainer[McpServerRuntime]
    greeting: str
    knowledge_revision_id: str
    api_tool_runtimes: _containers.RepeatedCompositeFieldContainer[ApiToolRuntime]
    knowledge_retrieval_capability: str
    a2a_tool_runtimes: _containers.RepeatedCompositeFieldContainer[A2aToolRuntime]
    built_in_tools: _containers.RepeatedCompositeFieldContainer[BuiltInTool]
    def __init__(self, prompt_agent_published_id: _Optional[str] = ..., llm_worker: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., instructions: _Optional[_Union[PromptInstructions, _Mapping]] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., tools: _Optional[_Iterable[_Union[NodeToolMetadata, _Mapping]]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., greeting: _Optional[str] = ..., knowledge_revision_id: _Optional[str] = ..., api_tool_runtimes: _Optional[_Iterable[_Union[ApiToolRuntime, _Mapping]]] = ..., knowledge_retrieval_capability: _Optional[str] = ..., a2a_tool_runtimes: _Optional[_Iterable[_Union[A2aToolRuntime, _Mapping]]] = ..., built_in_tools: _Optional[_Iterable[_Union[BuiltInTool, _Mapping]]] = ...) -> None: ...

class PublishedInlinePromptRuntime(_message.Message):
    __slots__ = ("node_id", "llm_worker", "instructions", "context_policy", "tools", "mcp_servers", "api_tool_runtimes", "a2a_tool_runtimes", "built_in_tools", "knowledge_revision_id", "knowledge_retrieval_capability")
    NODE_ID_FIELD_NUMBER: _ClassVar[int]
    LLM_WORKER_FIELD_NUMBER: _ClassVar[int]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    TOOLS_FIELD_NUMBER: _ClassVar[int]
    MCP_SERVERS_FIELD_NUMBER: _ClassVar[int]
    API_TOOL_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    A2A_TOOL_RUNTIMES_FIELD_NUMBER: _ClassVar[int]
    BUILT_IN_TOOLS_FIELD_NUMBER: _ClassVar[int]
    KNOWLEDGE_REVISION_ID_FIELD_NUMBER: _ClassVar[int]
    KNOWLEDGE_RETRIEVAL_CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    node_id: str
    llm_worker: _voice_runtime_pb2.LlmRuntime
    instructions: InlinePromptInstructions
    context_policy: ContextPolicy
    tools: _containers.RepeatedCompositeFieldContainer[NodeToolMetadata]
    mcp_servers: _containers.RepeatedCompositeFieldContainer[McpServerRuntime]
    api_tool_runtimes: _containers.RepeatedCompositeFieldContainer[ApiToolRuntime]
    a2a_tool_runtimes: _containers.RepeatedCompositeFieldContainer[A2aToolRuntime]
    built_in_tools: _containers.RepeatedCompositeFieldContainer[BuiltInTool]
    knowledge_revision_id: str
    knowledge_retrieval_capability: str
    def __init__(self, node_id: _Optional[str] = ..., llm_worker: _Optional[_Union[_voice_runtime_pb2.LlmRuntime, _Mapping]] = ..., instructions: _Optional[_Union[InlinePromptInstructions, _Mapping]] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., tools: _Optional[_Iterable[_Union[NodeToolMetadata, _Mapping]]] = ..., mcp_servers: _Optional[_Iterable[_Union[McpServerRuntime, _Mapping]]] = ..., api_tool_runtimes: _Optional[_Iterable[_Union[ApiToolRuntime, _Mapping]]] = ..., a2a_tool_runtimes: _Optional[_Iterable[_Union[A2aToolRuntime, _Mapping]]] = ..., built_in_tools: _Optional[_Iterable[_Union[BuiltInTool, _Mapping]]] = ..., knowledge_revision_id: _Optional[str] = ..., knowledge_retrieval_capability: _Optional[str] = ...) -> None: ...

class PublishedSupervisorSnapshot(_message.Message):
    __slots__ = ("supervisor_node_id", "specialists")
    SUPERVISOR_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    SPECIALISTS_FIELD_NUMBER: _ClassVar[int]
    supervisor_node_id: str
    specialists: _containers.RepeatedCompositeFieldContainer[PublishedSupervisorSpecialist]
    def __init__(self, supervisor_node_id: _Optional[str] = ..., specialists: _Optional[_Iterable[_Union[PublishedSupervisorSpecialist, _Mapping]]] = ...) -> None: ...

class PublishedSupervisorSpecialist(_message.Message):
    __slots__ = ("relation_id", "target_node_id", "route_description", "context_policy")
    RELATION_ID_FIELD_NUMBER: _ClassVar[int]
    TARGET_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    ROUTE_DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    relation_id: str
    target_node_id: str
    route_description: str
    context_policy: ContextPolicy
    def __init__(self, relation_id: _Optional[str] = ..., target_node_id: _Optional[str] = ..., route_description: _Optional[str] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ...) -> None: ...

class PublishedHandoffSnapshot(_message.Message):
    __slots__ = ("entry_node_id", "max_handoff_depth", "routes")
    ENTRY_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    MAX_HANDOFF_DEPTH_FIELD_NUMBER: _ClassVar[int]
    ROUTES_FIELD_NUMBER: _ClassVar[int]
    entry_node_id: str
    max_handoff_depth: int
    routes: _containers.RepeatedCompositeFieldContainer[PublishedHandoffRoute]
    def __init__(self, entry_node_id: _Optional[str] = ..., max_handoff_depth: _Optional[int] = ..., routes: _Optional[_Iterable[_Union[PublishedHandoffRoute, _Mapping]]] = ...) -> None: ...

class PublishedHandoffRoute(_message.Message):
    __slots__ = ("transition_id", "source_node_id", "target_node_id", "routing_description", "context_policy", "announcement", "parameters", "request_start")
    TRANSITION_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    TARGET_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    ROUTING_DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_POLICY_FIELD_NUMBER: _ClassVar[int]
    ANNOUNCEMENT_FIELD_NUMBER: _ClassVar[int]
    PARAMETERS_FIELD_NUMBER: _ClassVar[int]
    REQUEST_START_FIELD_NUMBER: _ClassVar[int]
    transition_id: str
    source_node_id: str
    target_node_id: str
    routing_description: str
    context_policy: ContextPolicy
    announcement: str
    parameters: _containers.RepeatedCompositeFieldContainer[HandoffParameter]
    request_start: str
    def __init__(self, transition_id: _Optional[str] = ..., source_node_id: _Optional[str] = ..., target_node_id: _Optional[str] = ..., routing_description: _Optional[str] = ..., context_policy: _Optional[_Union[ContextPolicy, str]] = ..., announcement: _Optional[str] = ..., parameters: _Optional[_Iterable[_Union[HandoffParameter, _Mapping]]] = ..., request_start: _Optional[str] = ...) -> None: ...

class HandoffParameter(_message.Message):
    __slots__ = ("name", "type", "description", "required", "string_enum", "number_enum", "boolean_enum")
    NAME_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    REQUIRED_FIELD_NUMBER: _ClassVar[int]
    STRING_ENUM_FIELD_NUMBER: _ClassVar[int]
    NUMBER_ENUM_FIELD_NUMBER: _ClassVar[int]
    BOOLEAN_ENUM_FIELD_NUMBER: _ClassVar[int]
    name: str
    type: HandoffParameterType
    description: str
    required: bool
    string_enum: _containers.RepeatedScalarFieldContainer[str]
    number_enum: _containers.RepeatedScalarFieldContainer[float]
    boolean_enum: _containers.RepeatedScalarFieldContainer[bool]
    def __init__(self, name: _Optional[str] = ..., type: _Optional[_Union[HandoffParameterType, str]] = ..., description: _Optional[str] = ..., required: _Optional[bool] = ..., string_enum: _Optional[_Iterable[str]] = ..., number_enum: _Optional[_Iterable[float]] = ..., boolean_enum: _Optional[_Iterable[bool]] = ...) -> None: ...

class TextRuntimeSnapshot(_message.Message):
    __slots__ = ("transport", "room_name", "participant_identity", "idle_timeout_seconds", "max_session_duration_seconds")
    TRANSPORT_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    IDLE_TIMEOUT_SECONDS_FIELD_NUMBER: _ClassVar[int]
    MAX_SESSION_DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    transport: str
    room_name: str
    participant_identity: str
    idle_timeout_seconds: int
    max_session_duration_seconds: int
    def __init__(self, transport: _Optional[str] = ..., room_name: _Optional[str] = ..., participant_identity: _Optional[str] = ..., idle_timeout_seconds: _Optional[int] = ..., max_session_duration_seconds: _Optional[int] = ...) -> None: ...

class CallRuntimeSnapshot(_message.Message):
    __slots__ = ("stt", "tts", "background_audio", "dtmf", "transport", "vad", "speech_policy", "limits", "conversation_filler")
    STT_FIELD_NUMBER: _ClassVar[int]
    TTS_FIELD_NUMBER: _ClassVar[int]
    BACKGROUND_AUDIO_FIELD_NUMBER: _ClassVar[int]
    DTMF_FIELD_NUMBER: _ClassVar[int]
    TRANSPORT_FIELD_NUMBER: _ClassVar[int]
    VAD_FIELD_NUMBER: _ClassVar[int]
    SPEECH_POLICY_FIELD_NUMBER: _ClassVar[int]
    LIMITS_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_FILLER_FIELD_NUMBER: _ClassVar[int]
    stt: _voice_runtime_pb2.SttRuntime
    tts: _voice_runtime_pb2.TtsRuntime
    background_audio: BackgroundAudioRuntime
    dtmf: DtmfInputRuntime
    transport: TransportRuntime
    vad: VadRuntime
    speech_policy: SpeechPolicyRuntime
    limits: CallLimitsRuntime
    conversation_filler: ConversationFillerRuntime
    def __init__(self, stt: _Optional[_Union[_voice_runtime_pb2.SttRuntime, _Mapping]] = ..., tts: _Optional[_Union[_voice_runtime_pb2.TtsRuntime, _Mapping]] = ..., background_audio: _Optional[_Union[BackgroundAudioRuntime, _Mapping]] = ..., dtmf: _Optional[_Union[DtmfInputRuntime, _Mapping]] = ..., transport: _Optional[_Union[TransportRuntime, _Mapping]] = ..., vad: _Optional[_Union[VadRuntime, _Mapping]] = ..., speech_policy: _Optional[_Union[SpeechPolicyRuntime, _Mapping]] = ..., limits: _Optional[_Union[CallLimitsRuntime, _Mapping]] = ..., conversation_filler: _Optional[_Union[ConversationFillerRuntime, _Mapping]] = ...) -> None: ...

class TransportRuntime(_message.Message):
    __slots__ = ("source", "room_name", "caller_participant_identity")
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    CALLER_PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    source: CallTransportSource
    room_name: str
    caller_participant_identity: str
    def __init__(self, source: _Optional[_Union[CallTransportSource, str]] = ..., room_name: _Optional[str] = ..., caller_participant_identity: _Optional[str] = ...) -> None: ...

class VadRuntime(_message.Message):
    __slots__ = ("noise_cancellation", "recognition_sensitivity")
    NOISE_CANCELLATION_FIELD_NUMBER: _ClassVar[int]
    RECOGNITION_SENSITIVITY_FIELD_NUMBER: _ClassVar[int]
    noise_cancellation: NoiseCancellationMode
    recognition_sensitivity: float
    def __init__(self, noise_cancellation: _Optional[_Union[NoiseCancellationMode, str]] = ..., recognition_sensitivity: _Optional[float] = ...) -> None: ...

class SpeechPolicyRuntime(_message.Message):
    __slots__ = ("response_speed", "allow_interruptions")
    RESPONSE_SPEED_FIELD_NUMBER: _ClassVar[int]
    ALLOW_INTERRUPTIONS_FIELD_NUMBER: _ClassVar[int]
    response_speed: float
    allow_interruptions: bool
    def __init__(self, response_speed: _Optional[float] = ..., allow_interruptions: _Optional[bool] = ...) -> None: ...

class CallLimitsRuntime(_message.Message):
    __slots__ = ("dial_wait_time_seconds", "max_call_duration_seconds", "no_answer_timeout_seconds")
    DIAL_WAIT_TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    MAX_CALL_DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    NO_ANSWER_TIMEOUT_SECONDS_FIELD_NUMBER: _ClassVar[int]
    dial_wait_time_seconds: int
    max_call_duration_seconds: int
    no_answer_timeout_seconds: int
    def __init__(self, dial_wait_time_seconds: _Optional[int] = ..., max_call_duration_seconds: _Optional[int] = ..., no_answer_timeout_seconds: _Optional[int] = ...) -> None: ...

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

class PromptInstructions(_message.Message):
    __slots__ = ("system_prompt", "guardrails")
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    GUARDRAILS_FIELD_NUMBER: _ClassVar[int]
    system_prompt: str
    guardrails: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, system_prompt: _Optional[str] = ..., guardrails: _Optional[_Iterable[str]] = ...) -> None: ...

class InlinePromptInstructions(_message.Message):
    __slots__ = ("system_prompt",)
    SYSTEM_PROMPT_FIELD_NUMBER: _ClassVar[int]
    system_prompt: str
    def __init__(self, system_prompt: _Optional[str] = ...) -> None: ...

class NodeToolMetadata(_message.Message):
    __slots__ = ("tool_id", "kind", "name", "description", "mcp", "api", "a2a")
    TOOL_ID_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    MCP_FIELD_NUMBER: _ClassVar[int]
    API_FIELD_NUMBER: _ClassVar[int]
    A2A_FIELD_NUMBER: _ClassVar[int]
    tool_id: str
    kind: str
    name: str
    description: str
    mcp: McpToolMetadata
    api: ApiToolMetadata
    a2a: A2aToolMetadata
    def __init__(self, tool_id: _Optional[str] = ..., kind: _Optional[str] = ..., name: _Optional[str] = ..., description: _Optional[str] = ..., mcp: _Optional[_Union[McpToolMetadata, _Mapping]] = ..., api: _Optional[_Union[ApiToolMetadata, _Mapping]] = ..., a2a: _Optional[_Union[A2aToolMetadata, _Mapping]] = ...) -> None: ...

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

class A2aToolMetadata(_message.Message):
    __slots__ = ("agent_card_url",)
    AGENT_CARD_URL_FIELD_NUMBER: _ClassVar[int]
    agent_card_url: str
    def __init__(self, agent_card_url: _Optional[str] = ...) -> None: ...

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

class A2aToolRuntime(_message.Message):
    __slots__ = ("tool_id", "headers", "timeout_ms")
    class HeadersEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    TOOL_ID_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    TIMEOUT_MS_FIELD_NUMBER: _ClassVar[int]
    tool_id: str
    headers: _containers.ScalarMap[str, str]
    timeout_ms: int
    def __init__(self, tool_id: _Optional[str] = ..., headers: _Optional[_Mapping[str, str]] = ..., timeout_ms: _Optional[int] = ...) -> None: ...

class BuiltInTool(_message.Message):
    __slots__ = ("end_call", "transfer_to_human")
    END_CALL_FIELD_NUMBER: _ClassVar[int]
    TRANSFER_TO_HUMAN_FIELD_NUMBER: _ClassVar[int]
    end_call: EndCallTool
    transfer_to_human: TransferToHumanTool
    def __init__(self, end_call: _Optional[_Union[EndCallTool, _Mapping]] = ..., transfer_to_human: _Optional[_Union[TransferToHumanTool, _Mapping]] = ...) -> None: ...

class EndCallTool(_message.Message):
    __slots__ = ("closing_phrase", "confirm")
    CLOSING_PHRASE_FIELD_NUMBER: _ClassVar[int]
    CONFIRM_FIELD_NUMBER: _ClassVar[int]
    closing_phrase: str
    confirm: bool
    def __init__(self, closing_phrase: _Optional[str] = ..., confirm: _Optional[bool] = ...) -> None: ...

class TransferToHumanTool(_message.Message):
    __slots__ = ("sip_call_to", "hold_phrase", "ringing_timeout_ms")
    SIP_CALL_TO_FIELD_NUMBER: _ClassVar[int]
    HOLD_PHRASE_FIELD_NUMBER: _ClassVar[int]
    RINGING_TIMEOUT_MS_FIELD_NUMBER: _ClassVar[int]
    sip_call_to: str
    hold_phrase: str
    ringing_timeout_ms: int
    def __init__(self, sip_call_to: _Optional[str] = ..., hold_phrase: _Optional[str] = ..., ringing_timeout_ms: _Optional[int] = ...) -> None: ...

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

class ConversationFillerRuntime(_message.Message):
    __slots__ = ("phrase",)
    PHRASE_FIELD_NUMBER: _ClassVar[int]
    phrase: str
    def __init__(self, phrase: _Optional[str] = ...) -> None: ...
