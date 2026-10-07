from buf.validate import validate_pb2 as _validate_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class RuntimePhase(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_PHASE_UNSPECIFIED: _ClassVar[RuntimePhase]
    RUNTIME_PHASE_INITIALIZING: _ClassVar[RuntimePhase]
    RUNTIME_PHASE_ACTIVE: _ClassVar[RuntimePhase]
    RUNTIME_PHASE_RECOVERING: _ClassVar[RuntimePhase]
    RUNTIME_PHASE_ENDING: _ClassVar[RuntimePhase]
    RUNTIME_PHASE_ENDED: _ClassVar[RuntimePhase]

class RuntimeMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_MODE_UNSPECIFIED: _ClassVar[RuntimeMode]
    RUNTIME_MODE_AGENT: _ClassVar[RuntimeMode]
    RUNTIME_MODE_HUMAN: _ClassVar[RuntimeMode]
    RUNTIME_MODE_TRANSFERRING: _ClassVar[RuntimeMode]
    RUNTIME_MODE_TEXT_RELAY: _ClassVar[RuntimeMode]

class RuntimeFenceStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_FENCE_STATUS_UNSPECIFIED: _ClassVar[RuntimeFenceStatus]
    RUNTIME_FENCE_STATUS_PENDING: _ClassVar[RuntimeFenceStatus]
    RUNTIME_FENCE_STATUS_RUNNING: _ClassVar[RuntimeFenceStatus]
    RUNTIME_FENCE_STATUS_RESOLVED: _ClassVar[RuntimeFenceStatus]
    RUNTIME_FENCE_STATUS_UNKNOWN: _ClassVar[RuntimeFenceStatus]

class RuntimeOperationStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_OPERATION_STATUS_UNSPECIFIED: _ClassVar[RuntimeOperationStatus]
    RUNTIME_OPERATION_STATUS_ACCEPTED: _ClassVar[RuntimeOperationStatus]
    RUNTIME_OPERATION_STATUS_RUNNING: _ClassVar[RuntimeOperationStatus]
    RUNTIME_OPERATION_STATUS_COMPLETED: _ClassVar[RuntimeOperationStatus]
    RUNTIME_OPERATION_STATUS_FAILED: _ClassVar[RuntimeOperationStatus]
    RUNTIME_OPERATION_STATUS_UNKNOWN: _ClassVar[RuntimeOperationStatus]

class RuntimeOperationKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_OPERATION_KIND_UNSPECIFIED: _ClassVar[RuntimeOperationKind]
    RUNTIME_OPERATION_KIND_INVOKE: _ClassVar[RuntimeOperationKind]
    RUNTIME_OPERATION_KIND_LIST: _ClassVar[RuntimeOperationKind]
    RUNTIME_OPERATION_KIND_CANCEL: _ClassVar[RuntimeOperationKind]
    RUNTIME_OPERATION_KIND_READBACK: _ClassVar[RuntimeOperationKind]

class RuntimeInputState(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    RUNTIME_INPUT_STATE_UNSPECIFIED: _ClassVar[RuntimeInputState]
    RUNTIME_INPUT_STATE_PENDING: _ClassVar[RuntimeInputState]
    RUNTIME_INPUT_STATE_COMMITTED: _ClassVar[RuntimeInputState]
    RUNTIME_INPUT_STATE_UNCONFIRMED: _ClassVar[RuntimeInputState]
RUNTIME_PHASE_UNSPECIFIED: RuntimePhase
RUNTIME_PHASE_INITIALIZING: RuntimePhase
RUNTIME_PHASE_ACTIVE: RuntimePhase
RUNTIME_PHASE_RECOVERING: RuntimePhase
RUNTIME_PHASE_ENDING: RuntimePhase
RUNTIME_PHASE_ENDED: RuntimePhase
RUNTIME_MODE_UNSPECIFIED: RuntimeMode
RUNTIME_MODE_AGENT: RuntimeMode
RUNTIME_MODE_HUMAN: RuntimeMode
RUNTIME_MODE_TRANSFERRING: RuntimeMode
RUNTIME_MODE_TEXT_RELAY: RuntimeMode
RUNTIME_FENCE_STATUS_UNSPECIFIED: RuntimeFenceStatus
RUNTIME_FENCE_STATUS_PENDING: RuntimeFenceStatus
RUNTIME_FENCE_STATUS_RUNNING: RuntimeFenceStatus
RUNTIME_FENCE_STATUS_RESOLVED: RuntimeFenceStatus
RUNTIME_FENCE_STATUS_UNKNOWN: RuntimeFenceStatus
RUNTIME_OPERATION_STATUS_UNSPECIFIED: RuntimeOperationStatus
RUNTIME_OPERATION_STATUS_ACCEPTED: RuntimeOperationStatus
RUNTIME_OPERATION_STATUS_RUNNING: RuntimeOperationStatus
RUNTIME_OPERATION_STATUS_COMPLETED: RuntimeOperationStatus
RUNTIME_OPERATION_STATUS_FAILED: RuntimeOperationStatus
RUNTIME_OPERATION_STATUS_UNKNOWN: RuntimeOperationStatus
RUNTIME_OPERATION_KIND_UNSPECIFIED: RuntimeOperationKind
RUNTIME_OPERATION_KIND_INVOKE: RuntimeOperationKind
RUNTIME_OPERATION_KIND_LIST: RuntimeOperationKind
RUNTIME_OPERATION_KIND_CANCEL: RuntimeOperationKind
RUNTIME_OPERATION_KIND_READBACK: RuntimeOperationKind
RUNTIME_INPUT_STATE_UNSPECIFIED: RuntimeInputState
RUNTIME_INPUT_STATE_PENDING: RuntimeInputState
RUNTIME_INPUT_STATE_COMMITTED: RuntimeInputState
RUNTIME_INPUT_STATE_UNCONFIRMED: RuntimeInputState

class RuntimeAuthorization(_message.Message):
    __slots__ = ("execution_id", "epoch", "capability")
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    execution_id: str
    epoch: int
    capability: str
    def __init__(self, execution_id: _Optional[str] = ..., epoch: _Optional[int] = ..., capability: _Optional[str] = ...) -> None: ...

class RuntimeAttemptAuthorization(_message.Message):
    __slots__ = ("attempt_id", "capability")
    ATTEMPT_ID_FIELD_NUMBER: _ClassVar[int]
    CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    attempt_id: str
    capability: str
    def __init__(self, attempt_id: _Optional[str] = ..., capability: _Optional[str] = ...) -> None: ...

class RuntimeHelperAuthorization(_message.Message):
    __slots__ = ("helper_execution_id", "epoch", "transfer_attempt_id", "capability")
    HELPER_EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    TRANSFER_ATTEMPT_ID_FIELD_NUMBER: _ClassVar[int]
    CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    helper_execution_id: str
    epoch: int
    transfer_attempt_id: str
    capability: str
    def __init__(self, helper_execution_id: _Optional[str] = ..., epoch: _Optional[int] = ..., transfer_attempt_id: _Optional[str] = ..., capability: _Optional[str] = ...) -> None: ...

class RuntimeReceiptAuthorization(_message.Message):
    __slots__ = ("execution_id", "capability")
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    execution_id: str
    capability: str
    def __init__(self, execution_id: _Optional[str] = ..., capability: _Optional[str] = ...) -> None: ...

class RuntimeAssignment(_message.Message):
    __slots__ = ("launcher_id", "launcher_incarnation", "worker_id", "job_id", "dispatch_id", "room_name", "room_sid", "participant_identity", "compatibility_fingerprint", "session_id", "conversation_id")
    LAUNCHER_ID_FIELD_NUMBER: _ClassVar[int]
    LAUNCHER_INCARNATION_FIELD_NUMBER: _ClassVar[int]
    WORKER_ID_FIELD_NUMBER: _ClassVar[int]
    JOB_ID_FIELD_NUMBER: _ClassVar[int]
    DISPATCH_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    ROOM_SID_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    COMPATIBILITY_FINGERPRINT_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    launcher_id: str
    launcher_incarnation: str
    worker_id: str
    job_id: str
    dispatch_id: str
    room_name: str
    room_sid: str
    participant_identity: str
    compatibility_fingerprint: str
    session_id: str
    conversation_id: str
    def __init__(self, launcher_id: _Optional[str] = ..., launcher_incarnation: _Optional[str] = ..., worker_id: _Optional[str] = ..., job_id: _Optional[str] = ..., dispatch_id: _Optional[str] = ..., room_name: _Optional[str] = ..., room_sid: _Optional[str] = ..., participant_identity: _Optional[str] = ..., compatibility_fingerprint: _Optional[str] = ..., session_id: _Optional[str] = ..., conversation_id: _Optional[str] = ...) -> None: ...

class RuntimeProjection(_message.Message):
    __slots__ = ("conversation_id", "session_id", "phase", "mode", "epoch", "revision", "execution_id", "worker_identity", "recovery_deadline", "relay_generation", "last_committed_input_id", "last_unconfirmed_input_id", "transfer_attempt_id", "transfer_phase", "transfer_helper_identity")
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    PHASE_FIELD_NUMBER: _ClassVar[int]
    MODE_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    REVISION_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    WORKER_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    RECOVERY_DEADLINE_FIELD_NUMBER: _ClassVar[int]
    RELAY_GENERATION_FIELD_NUMBER: _ClassVar[int]
    LAST_COMMITTED_INPUT_ID_FIELD_NUMBER: _ClassVar[int]
    LAST_UNCONFIRMED_INPUT_ID_FIELD_NUMBER: _ClassVar[int]
    TRANSFER_ATTEMPT_ID_FIELD_NUMBER: _ClassVar[int]
    TRANSFER_PHASE_FIELD_NUMBER: _ClassVar[int]
    TRANSFER_HELPER_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    conversation_id: str
    session_id: str
    phase: RuntimePhase
    mode: RuntimeMode
    epoch: int
    revision: int
    execution_id: str
    worker_identity: str
    recovery_deadline: str
    relay_generation: int
    last_committed_input_id: str
    last_unconfirmed_input_id: str
    transfer_attempt_id: str
    transfer_phase: str
    transfer_helper_identity: str
    def __init__(self, conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ..., phase: _Optional[_Union[RuntimePhase, str]] = ..., mode: _Optional[_Union[RuntimeMode, str]] = ..., epoch: _Optional[int] = ..., revision: _Optional[int] = ..., execution_id: _Optional[str] = ..., worker_identity: _Optional[str] = ..., recovery_deadline: _Optional[str] = ..., relay_generation: _Optional[int] = ..., last_committed_input_id: _Optional[str] = ..., last_unconfirmed_input_id: _Optional[str] = ..., transfer_attempt_id: _Optional[str] = ..., transfer_phase: _Optional[str] = ..., transfer_helper_identity: _Optional[str] = ...) -> None: ...

class RuntimeLease(_message.Message):
    __slots__ = ("authorization", "helper_authorization", "protocol_revision", "lease_expires_at", "original_deadline", "recovery_deadline", "projection", "receipt_capability", "participant_token", "server_time", "renew_after_ms", "original_binding", "helper_binding")
    AUTHORIZATION_FIELD_NUMBER: _ClassVar[int]
    HELPER_AUTHORIZATION_FIELD_NUMBER: _ClassVar[int]
    PROTOCOL_REVISION_FIELD_NUMBER: _ClassVar[int]
    LEASE_EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_DEADLINE_FIELD_NUMBER: _ClassVar[int]
    RECOVERY_DEADLINE_FIELD_NUMBER: _ClassVar[int]
    PROJECTION_FIELD_NUMBER: _ClassVar[int]
    RECEIPT_CAPABILITY_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_TOKEN_FIELD_NUMBER: _ClassVar[int]
    SERVER_TIME_FIELD_NUMBER: _ClassVar[int]
    RENEW_AFTER_MS_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_BINDING_FIELD_NUMBER: _ClassVar[int]
    HELPER_BINDING_FIELD_NUMBER: _ClassVar[int]
    authorization: RuntimeAuthorization
    helper_authorization: RuntimeHelperAuthorization
    protocol_revision: str
    lease_expires_at: str
    original_deadline: str
    recovery_deadline: str
    projection: RuntimeProjection
    receipt_capability: RuntimeReceiptAuthorization
    participant_token: str
    server_time: str
    renew_after_ms: int
    original_binding: RuntimeOriginalBinding
    helper_binding: RuntimeHelperBinding
    def __init__(self, authorization: _Optional[_Union[RuntimeAuthorization, _Mapping]] = ..., helper_authorization: _Optional[_Union[RuntimeHelperAuthorization, _Mapping]] = ..., protocol_revision: _Optional[str] = ..., lease_expires_at: _Optional[str] = ..., original_deadline: _Optional[str] = ..., recovery_deadline: _Optional[str] = ..., projection: _Optional[_Union[RuntimeProjection, _Mapping]] = ..., receipt_capability: _Optional[_Union[RuntimeReceiptAuthorization, _Mapping]] = ..., participant_token: _Optional[str] = ..., server_time: _Optional[str] = ..., renew_after_ms: _Optional[int] = ..., original_binding: _Optional[_Union[RuntimeOriginalBinding, _Mapping]] = ..., helper_binding: _Optional[_Union[RuntimeHelperBinding, _Mapping]] = ...) -> None: ...

class RuntimeOriginalBinding(_message.Message):
    __slots__ = ("published_id", "contract_revision", "room_name", "room_sid", "caller_identity", "caller_sid", "started_at")
    PUBLISHED_ID_FIELD_NUMBER: _ClassVar[int]
    CONTRACT_REVISION_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    ROOM_SID_FIELD_NUMBER: _ClassVar[int]
    CALLER_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    CALLER_SID_FIELD_NUMBER: _ClassVar[int]
    STARTED_AT_FIELD_NUMBER: _ClassVar[int]
    published_id: str
    contract_revision: str
    room_name: str
    room_sid: str
    caller_identity: str
    caller_sid: str
    started_at: str
    def __init__(self, published_id: _Optional[str] = ..., contract_revision: _Optional[str] = ..., room_name: _Optional[str] = ..., room_sid: _Optional[str] = ..., caller_identity: _Optional[str] = ..., caller_sid: _Optional[str] = ..., started_at: _Optional[str] = ...) -> None: ...

class RuntimeHelperBinding(_message.Message):
    __slots__ = ("transfer_attempt_id", "helper_execution_id", "helper_generation", "room_name", "room_sid", "helper_identity", "consultant_identity", "consultant_sid", "original_deadline")
    TRANSFER_ATTEMPT_ID_FIELD_NUMBER: _ClassVar[int]
    HELPER_EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    HELPER_GENERATION_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    ROOM_SID_FIELD_NUMBER: _ClassVar[int]
    HELPER_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    CONSULTANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    CONSULTANT_SID_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_DEADLINE_FIELD_NUMBER: _ClassVar[int]
    transfer_attempt_id: str
    helper_execution_id: str
    helper_generation: int
    room_name: str
    room_sid: str
    helper_identity: str
    consultant_identity: str
    consultant_sid: str
    original_deadline: str
    def __init__(self, transfer_attempt_id: _Optional[str] = ..., helper_execution_id: _Optional[str] = ..., helper_generation: _Optional[int] = ..., room_name: _Optional[str] = ..., room_sid: _Optional[str] = ..., helper_identity: _Optional[str] = ..., consultant_identity: _Optional[str] = ..., consultant_sid: _Optional[str] = ..., original_deadline: _Optional[str] = ...) -> None: ...

class RuntimeCheckpointHeader(_message.Message):
    __slots__ = ("revision", "codec", "compatibility_fingerprint", "execution_id", "epoch", "committed_at", "expires_at", "payload_hash")
    REVISION_FIELD_NUMBER: _ClassVar[int]
    CODEC_FIELD_NUMBER: _ClassVar[int]
    COMPATIBILITY_FINGERPRINT_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    COMMITTED_AT_FIELD_NUMBER: _ClassVar[int]
    EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    PAYLOAD_HASH_FIELD_NUMBER: _ClassVar[int]
    revision: int
    codec: str
    compatibility_fingerprint: str
    execution_id: str
    epoch: int
    committed_at: str
    expires_at: str
    payload_hash: str
    def __init__(self, revision: _Optional[int] = ..., codec: _Optional[str] = ..., compatibility_fingerprint: _Optional[str] = ..., execution_id: _Optional[str] = ..., epoch: _Optional[int] = ..., committed_at: _Optional[str] = ..., expires_at: _Optional[str] = ..., payload_hash: _Optional[str] = ...) -> None: ...

class RuntimeCheckpoint(_message.Message):
    __slots__ = ("header", "checkpoint_payload")
    HEADER_FIELD_NUMBER: _ClassVar[int]
    CHECKPOINT_PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    header: RuntimeCheckpointHeader
    checkpoint_payload: bytes
    def __init__(self, header: _Optional[_Union[RuntimeCheckpointHeader, _Mapping]] = ..., checkpoint_payload: _Optional[bytes] = ...) -> None: ...

class RuntimeMediaFence(_message.Message):
    __slots__ = ("fence_id", "execution_id", "epoch", "participant_identity", "room_name", "room_sid", "token_cutoff_at", "status")
    FENCE_ID_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_IDENTITY_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    ROOM_SID_FIELD_NUMBER: _ClassVar[int]
    TOKEN_CUTOFF_AT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    fence_id: str
    execution_id: str
    epoch: int
    participant_identity: str
    room_name: str
    room_sid: str
    token_cutoff_at: str
    status: RuntimeFenceStatus
    def __init__(self, fence_id: _Optional[str] = ..., execution_id: _Optional[str] = ..., epoch: _Optional[int] = ..., participant_identity: _Optional[str] = ..., room_name: _Optional[str] = ..., room_sid: _Optional[str] = ..., token_cutoff_at: _Optional[str] = ..., status: _Optional[_Union[RuntimeFenceStatus, str]] = ...) -> None: ...

class RuntimeProviderCorrelation(_message.Message):
    __slots__ = ("provider_request_id", "remote_session_id", "remote_generation", "task_id", "context_id", "message_id", "selected_endpoint", "selected_version", "principal_revision", "remote_generation_id")
    PROVIDER_REQUEST_ID_FIELD_NUMBER: _ClassVar[int]
    REMOTE_SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    REMOTE_GENERATION_FIELD_NUMBER: _ClassVar[int]
    TASK_ID_FIELD_NUMBER: _ClassVar[int]
    CONTEXT_ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    SELECTED_ENDPOINT_FIELD_NUMBER: _ClassVar[int]
    SELECTED_VERSION_FIELD_NUMBER: _ClassVar[int]
    PRINCIPAL_REVISION_FIELD_NUMBER: _ClassVar[int]
    REMOTE_GENERATION_ID_FIELD_NUMBER: _ClassVar[int]
    provider_request_id: str
    remote_session_id: str
    remote_generation: int
    task_id: str
    context_id: str
    message_id: str
    selected_endpoint: str
    selected_version: str
    principal_revision: str
    remote_generation_id: str
    def __init__(self, provider_request_id: _Optional[str] = ..., remote_session_id: _Optional[str] = ..., remote_generation: _Optional[int] = ..., task_id: _Optional[str] = ..., context_id: _Optional[str] = ..., message_id: _Optional[str] = ..., selected_endpoint: _Optional[str] = ..., selected_version: _Optional[str] = ..., principal_revision: _Optional[str] = ..., remote_generation_id: _Optional[str] = ...) -> None: ...

class RuntimeOperation(_message.Message):
    __slots__ = ("operation_id", "intent_id", "status", "result_json", "failure_code", "confirmed_no_effect", "node_id", "frame_id", "activation_id", "expected_binding_version", "input_turn_id", "transition_id", "delivery_target", "provider_correlation", "operation_kind", "execution_id", "epoch")
    OPERATION_ID_FIELD_NUMBER: _ClassVar[int]
    INTENT_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    RESULT_JSON_FIELD_NUMBER: _ClassVar[int]
    FAILURE_CODE_FIELD_NUMBER: _ClassVar[int]
    CONFIRMED_NO_EFFECT_FIELD_NUMBER: _ClassVar[int]
    NODE_ID_FIELD_NUMBER: _ClassVar[int]
    FRAME_ID_FIELD_NUMBER: _ClassVar[int]
    ACTIVATION_ID_FIELD_NUMBER: _ClassVar[int]
    EXPECTED_BINDING_VERSION_FIELD_NUMBER: _ClassVar[int]
    INPUT_TURN_ID_FIELD_NUMBER: _ClassVar[int]
    TRANSITION_ID_FIELD_NUMBER: _ClassVar[int]
    DELIVERY_TARGET_FIELD_NUMBER: _ClassVar[int]
    PROVIDER_CORRELATION_FIELD_NUMBER: _ClassVar[int]
    OPERATION_KIND_FIELD_NUMBER: _ClassVar[int]
    EXECUTION_ID_FIELD_NUMBER: _ClassVar[int]
    EPOCH_FIELD_NUMBER: _ClassVar[int]
    operation_id: str
    intent_id: str
    status: RuntimeOperationStatus
    result_json: str
    failure_code: str
    confirmed_no_effect: bool
    node_id: str
    frame_id: str
    activation_id: str
    expected_binding_version: int
    input_turn_id: str
    transition_id: str
    delivery_target: str
    provider_correlation: RuntimeProviderCorrelation
    operation_kind: RuntimeOperationKind
    execution_id: str
    epoch: int
    def __init__(self, operation_id: _Optional[str] = ..., intent_id: _Optional[str] = ..., status: _Optional[_Union[RuntimeOperationStatus, str]] = ..., result_json: _Optional[str] = ..., failure_code: _Optional[str] = ..., confirmed_no_effect: _Optional[bool] = ..., node_id: _Optional[str] = ..., frame_id: _Optional[str] = ..., activation_id: _Optional[str] = ..., expected_binding_version: _Optional[int] = ..., input_turn_id: _Optional[str] = ..., transition_id: _Optional[str] = ..., delivery_target: _Optional[str] = ..., provider_correlation: _Optional[_Union[RuntimeProviderCorrelation, _Mapping]] = ..., operation_kind: _Optional[_Union[RuntimeOperationKind, str]] = ..., execution_id: _Optional[str] = ..., epoch: _Optional[int] = ...) -> None: ...

class RuntimeInputReceipt(_message.Message):
    __slots__ = ("input_id", "state", "relay_generation", "committed_revision")
    INPUT_ID_FIELD_NUMBER: _ClassVar[int]
    STATE_FIELD_NUMBER: _ClassVar[int]
    RELAY_GENERATION_FIELD_NUMBER: _ClassVar[int]
    COMMITTED_REVISION_FIELD_NUMBER: _ClassVar[int]
    input_id: str
    state: RuntimeInputState
    relay_generation: int
    committed_revision: int
    def __init__(self, input_id: _Optional[str] = ..., state: _Optional[_Union[RuntimeInputState, str]] = ..., relay_generation: _Optional[int] = ..., committed_revision: _Optional[int] = ...) -> None: ...
