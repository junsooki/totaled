"""The claim as read from the insurer's valuation report and offer letter."""
from typing import List, Optional

from pydantic import BaseModel


class Source(BaseModel):
    page: int  # 1-indexed page in the report PDF
    quote: str  # exact text on that page, used to highlight it


class Adjustment(BaseModel):
    label: str
    amount: float  # signed dollars added to the comparable's price


class Comparable(BaseModel):
    id: str
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    vin: Optional[str] = None
    stock_number: Optional[str] = None
    plate: Optional[str] = None
    seller_name: Optional[str] = None
    seller_contact: Optional[str] = None
    distance_mi: Optional[float] = None
    listing_date: Optional[str] = None  # YYYY-MM-DD
    odometer: Optional[int] = None
    options: List[str] = []
    list_price: float
    adjustments: List[Adjustment] = []
    adjusted_value: Optional[float] = None  # as stated in the report
    source: Optional[Source] = None


class Vehicle(BaseModel):
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    vin: Optional[str] = None
    mileage: int
    options: List[str] = []


class Condition(BaseModel):
    subject_grade: Optional[str] = None  # e.g. "Average", "Below Average"
    documented: bool = False  # inspection notes or photos support the grade
    deduction: float = 0  # dollars subtracted (positive number)
    source: Optional[Source] = None


class Offer(BaseModel):
    offer_date: str  # YYYY-MM-DD
    base_value: float  # as stated in the report
    condition_adjustment: float = 0  # signed
    sales_tax: Optional[float] = None
    title_fees: Optional[float] = None
    registration_prorated: Optional[float] = None
    deductible: float = 0
    total: float
    written_explanation: bool = False
    source: Optional[Source] = None


class Claim(BaseModel):
    owner_zip: str
    vehicle: Vehicle
    offer: Offer
    condition: Condition
    comparables: List[Comparable]
