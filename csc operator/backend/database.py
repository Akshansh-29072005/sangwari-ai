from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, JSON, func
from datetime import datetime
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./nagarikai.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Citizen(Base):
    __tablename__ = "citizens"
    citizen_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    dob = Column(String)
    age = Column(Integer)
    gender = Column(String)
    district = Column(String)
    village_or_city = Column(String)
    address = Column(String)
    pincode = Column(Integer)
    occupation = Column(String)
    annual_income = Column(Float)
    marital_status = Column(String, nullable=True)
    caste = Column(String)

    aadhar_number = Column(String)
    mobile_number = Column(String)
    is_deceased = Column(Boolean, default=False)

class Scheme(Base):
    __tablename__ = "schemes"
    scheme_id = Column(Integer, primary_key=True, index=True)
    scheme_name = Column(String)
    department = Column(String)
    description = Column(String)

class SchemeRule(Base):
    __tablename__ = "scheme_rules"
    rule_id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.scheme_id"))
    field = Column(String)
    operator = Column(String)
    value = Column(String)

class SchemeApplication(Base):
    __tablename__ = "scheme_applications"
    application_id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"))
    scheme_id = Column(Integer, ForeignKey("schemes.scheme_id"))
    application_data_json = Column(String)
    approval_confidence = Column(Float)
    status = Column(String)

class EligibilityResult(Base):
    __tablename__ = "eligibility_results"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"))
    scheme_id = Column(Integer, ForeignKey("schemes.scheme_id"))
    status = Column(String)
    reasoning = Column(String)

class DocumentField(Base):
    __tablename__ = "document_fields"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"))
    document_type = Column(String)  # 'aadhaar', 'ration_card', 'income_certificate', etc.
    field_name = Column(String)     # 'name', 'address', 'dob', etc.
    field_value = Column(String)

class MismatchResult(Base):
    __tablename__ = "mismatch_results"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"))
    field_name = Column(String)
    value_doc1 = Column(String)
    value_doc2 = Column(String)
    similarity_score = Column(Float)
    severity = Column(String)       # 'minor', 'moderate', 'critical'

class DeathRecord(Base):
    __tablename__ = "death_records"
    record_id = Column(String, primary_key=True, index=True)
    deceased_name = Column(String)
    spouse_name = Column(String, nullable=True)
    village = Column(String)
    district = Column(String)
    death_date = Column(String)
    death_certificate_id = Column(String)

class AnomalyCase(Base):
    __tablename__ = "anomaly_cases"
    case_id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"), nullable=True)
    anomaly_type = Column(String)
    description = Column(String)
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"))
    scheme_id = Column(Integer, ForeignKey("schemes.scheme_id"))
    message = Column(String)
    sent_at = Column(DateTime, server_default=func.now())
    status = Column(String, default="sent") # sent, failed, read

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(String, primary_key=True, index=True) # UUID string or dataset complaint_id
    citizen_name = Column(String)
    mobile = Column(String)
    aadhaar_number = Column(String, nullable=True)
    district = Column(String)
    complaint_text = Column(String)
    category = Column(String)
    detected_department = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    department = Column(String, nullable=True)
    status = Column(String)
    priority = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    assigned_officer_id = Column(String, nullable=True) # Can be dataset ID
    resolution_time_days = Column(Integer, nullable=True) # From dataset
    expected_resolution_time = Column(Integer, nullable=True)

    complaint_embedding = Column(JSON, nullable=True)
    cluster_id = Column(Integer, ForeignKey("grievance_clusters.id"), nullable=True)

class GrievanceCluster(Base):
    __tablename__ = "grievance_clusters"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    primary_grievance = Column(String)
    complaint_count = Column(Integer, default=1)
    department = Column(String)
    district = Column(String, nullable=True)

class GrievanceStatusHistory(Base):
    __tablename__ = "grievance_status_history"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    grievance_id = Column(String, ForeignKey("grievances.id"))
    status = Column(String)
    updated_by = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now())

class Officer(Base):
    __tablename__ = "officers"
    officer_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    district = Column(String)
    email = Column(String, nullable=True)

class EscalationLog(Base):
    __tablename__ = "escalation_log"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    grievance_id = Column(String, ForeignKey("grievances.id"))
    previous_officer = Column(String, ForeignKey("officers.officer_id"), nullable=True)
    escalated_to = Column(String, ForeignKey("officers.officer_id"), nullable=True)
    reason = Column(String)
    timestamp = Column(DateTime, server_default=func.now())

class DepartmentMapping(Base):
    __tablename__ = "department_mapping"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, index=True)
    department = Column(String)

class GrievanceNotification(Base):
    __tablename__ = "grievance_notifications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    grievance_id = Column(String, ForeignKey("grievances.id"), nullable=True)
    application_id = Column(String, ForeignKey("applications.application_id"), nullable=True)
    mobile = Column(String, nullable=True)        # citizen mobile number
    citizen_name = Column(String, nullable=True)  # citizen name
    event_type = Column(String)                   # REGISTERED, INVESTIGATING, DOCS_NEEDED, ESCALATED, RESOLVED, etc.
    message = Column(String)                      # Full notification message text
    sent_at = Column(DateTime, server_default=func.now())
    delivery_status = Column(String, default="simulated")  # simulated / sent / failed

class Application(Base):
    __tablename__ = "applications"
    application_id = Column(String, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.citizen_id"), nullable=True)
    citizen_name = Column(String)
    mobile_number = Column(String)
    service_type = Column(String)
    department = Column(String)
    status = Column(String, default="Submitted")
    submitted_by = Column(String, nullable=True) # CSC Operator ID
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    expected_completion = Column(DateTime, nullable=True)
    is_delayed = Column(Boolean, default=False)

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String, ForeignKey("applications.application_id"))
    status = Column(String)
    updated_by = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

class ServiceSLA(Base):
    __tablename__ = "service_sla"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    service_name = Column(String, unique=True)
    sla_days = Column(Integer)
    department = Column(String)

def init_db():
    # Use create_all without drop_all so existing real data is preserved
    Base.metadata.create_all(bind=engine)
