from buf.validate import validate_pb2 as _validate_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ResolveLeaseRequest(_message.Message):
    __slots__ = ("lease_id", "conversation_id", "session_id")
    LEASE_ID_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    lease_id: str
    conversation_id: str
    session_id: str
    def __init__(self, lease_id: _Optional[str] = ..., conversation_id: _Optional[str] = ..., session_id: _Optional[str] = ...) -> None: ...

class ResolveLeaseResponse(_message.Message):
    __slots__ = ("stt", "llm", "tts")
    STT_FIELD_NUMBER: _ClassVar[int]
    LLM_FIELD_NUMBER: _ClassVar[int]
    TTS_FIELD_NUMBER: _ClassVar[int]
    stt: SttRuntime
    llm: LlmRuntime
    tts: TtsRuntime
    def __init__(self, stt: _Optional[_Union[SttRuntime, _Mapping]] = ..., llm: _Optional[_Union[LlmRuntime, _Mapping]] = ..., tts: _Optional[_Union[TtsRuntime, _Mapping]] = ...) -> None: ...

class SttRuntime(_message.Message):
    __slots__ = ("api_key", "model", "language")
    API_KEY_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    api_key: str
    model: str
    language: str
    def __init__(self, api_key: _Optional[str] = ..., model: _Optional[str] = ..., language: _Optional[str] = ...) -> None: ...

class LlmRuntime(_message.Message):
    __slots__ = ("api_key", "model")
    API_KEY_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    api_key: str
    model: str
    def __init__(self, api_key: _Optional[str] = ..., model: _Optional[str] = ...) -> None: ...

class TtsRuntime(_message.Message):
    __slots__ = ("api_key", "model", "language", "voice_id")
    API_KEY_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    VOICE_ID_FIELD_NUMBER: _ClassVar[int]
    api_key: str
    model: str
    language: str
    voice_id: str
    def __init__(self, api_key: _Optional[str] = ..., model: _Optional[str] = ..., language: _Optional[str] = ..., voice_id: _Optional[str] = ...) -> None: ...
