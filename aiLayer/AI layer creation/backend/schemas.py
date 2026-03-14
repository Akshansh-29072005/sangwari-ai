from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

# =======================
# CITIZEN SCHEMAS
# =======================

class CitizenMasterBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    income: Optional[float] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    caste: Optional[str] = None
    is_student: Optional[bool] = False
    spouse_dead: Optional[bool] = False
    extra_data: Optional[Dict[str, Any]] = {}

class CitizenMasterCreate(CitizenMasterBase):
    pass

class CitizenMasterOut(CitizenMasterBase):
    id: UUID
    citizen_id: UUID
    
    model_config = ConfigDict(from_attributes=True)

class CitizenCreate(BaseModel):
    mobile_number: str
    mpin: str

class CitizenLogin(BaseModel):
    mobile_number: str
    mpin: str
    
class CitizenOut(BaseModel):
    id: UUID
    mobile_number: str
    created_at: datetime
    master_data: Optional[CitizenMasterOut] = None

    model_config = ConfigDict(from_attributes=True)

# =======================
# COMPLAINT SCHEMAS
# =======================

class ComplaintCreate(BaseModel):
    text: str

class ComplaintPredictionOut(BaseModel):
    predicted_department: str
    confidence_score: float
    estimated_resolution_days: int

    model_config = ConfigDict(from_attributes=True)

class ComplaintOut(BaseModel):
    id: UUID
    citizen_id: Optional[UUID] = None
    text: str
    status: str
    created_at: datetime
    prediction: Optional[ComplaintPredictionOut] = None

    model_config = ConfigDict(from_attributes=True)

# =======================
# SCHEME SCHEMAS
# =======================

class SchemeRuleBase(BaseModel):
    field_name: str
    condition: str
    value: str

class SchemeRuleOut(SchemeRuleBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)

class SchemeBase(BaseModel):
    title: str
    description: str

class SchemeOut(SchemeBase):
    id: UUID
    rules: List[SchemeRuleOut] = []

    model_config = ConfigDict(from_attributes=True)

# =======================
# APPLICATION SCHEMAS
# =======================

class SchemeApplicationCreate(BaseModel):
    scheme_id: UUID
    form_data: Dict[str, Any]

class VerificationLogOut(BaseModel):
    status: str
    confidence_score: float
    reasons: List[str]

    model_config = ConfigDict(from_attributes=True)

class SchemeApplicationOut(BaseModel):
    id: UUID
    citizen_id: UUID
    scheme_id: UUID
    form_data: dict
    status: str
    created_at: datetime
    verification_log: Optional[VerificationLogOut] = None

    model_config = ConfigDict(from_attributes=True)

# =======================
# OPERATOR SCHEMAS
# =======================

class OperatorCreate(BaseModel):
    employee_id: str
    password: str
    email: str
    department: str
    role: Optional[str] = "Operator"

class OperatorOut(BaseModel):
    id: UUID
    employee_id: str
    email: str
    department: str
    role: str

    model_config = ConfigDict(from_attributes=True)
