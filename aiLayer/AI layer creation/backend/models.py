from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from database import Base

class Citizen(Base):
    __tablename__ = "citizens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    mobile_number = Column(String, unique=True, index=True)
    mpin_hash = Column(String)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    master_data = relationship("CitizenMaster", back_populates="citizen", uselist=False)
    complaints = relationship("Complaint", back_populates="citizen")
    applications = relationship("SchemeApplication", back_populates="citizen")

class CitizenMaster(Base):
    __tablename__ = "citizen_master"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    citizen_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id"))
    
    # Demographics and Info
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String)
    district = Column(String)
    
    # Socio-economic features
    income = Column(Float)
    occupation = Column(String)
    marital_status = Column(String)
    caste = Column(String)
    
    # Derived/Extra Features
    is_student = Column(Boolean, default=False)
    spouse_dead = Column(Boolean, default=False)
    
    # JSON for extra dynamic parameters like aadhar_number
    extra_data = Column(JSON, default={})
    
    citizen = relationship("Citizen", back_populates="master_data")

class Complaint(Base):
    __tablename__ = "complaints"
    # Go has complaints table, so match its ID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    citizen_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id"), nullable=True) # made nullable to avoid Go conflict if it uses UserID
    text = Column(Text)
    status = Column(String, default="Pending") # Pending, Forwarded, Resolved
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    
    # We only define relations here, we're not migrating the Go table again
    prediction = relationship("ComplaintPrediction", back_populates="complaint", uselist=False)
    citizen = relationship("Citizen", back_populates="complaints")

class ComplaintPrediction(Base):
    __tablename__ = "complaint_predictions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"))
    predicted_department = Column(String)
    confidence_score = Column(Float)
    estimated_resolution_days = Column(Integer)
    
    complaint = relationship("Complaint", back_populates="prediction")

class Scheme(Base):
    __tablename__ = "schemes"
    # match Go scheme ID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, index=True) # Go has 'title'
    description = Column(Text)
    # Go Scheme entity doesn't have department
    
    rules = relationship("SchemeRule", back_populates="scheme")
    applications = relationship("SchemeApplication", back_populates="scheme")

class SchemeRule(Base):
    __tablename__ = "scheme_rules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("schemes.id"))
    field_name = Column(String) # e.g., 'age'
    condition = Column(String) # e.g., '>=', '==', '<'
    value = Column(String) # e.g., '60', 'female'
    
    scheme = relationship("Scheme", back_populates="rules")

class SchemeApplication(Base):
    __tablename__ = "scheme_applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    citizen_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id"))
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("schemes.id"))
    
    # The filled in form data in JSON
    form_data = Column(JSON, default={})
    
    status = Column(String, default="Submitted") # Submitted, Under Review, Approved, Rejected
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    
    verification_log = relationship("VerificationLog", back_populates="application", uselist=False)
    
    citizen = relationship("Citizen", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("scheme_applications.id"))
    status = Column(String) # Approved, Rejected
    confidence_score = Column(Float)
    reasons = Column(JSON, default=[]) # List of issues
    
    application = relationship("SchemeApplication", back_populates="verification_log")

class Operator(Base):
    __tablename__ = "operators"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(String, unique=True, index=True)
    password_hash = Column(String)
    email = Column(String, unique=True)
    department = Column(String)
    role = Column(String, default="Operator")
