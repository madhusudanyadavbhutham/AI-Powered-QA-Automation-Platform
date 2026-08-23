from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    test_case_id: Mapped[int] = mapped_column(
        ForeignKey("test_cases.id"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="running",
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class TestRunStep(Base):
    __tablename__ = "test_run_steps"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    test_run_id: Mapped[int] = mapped_column(
        ForeignKey("test_runs.id"),
        nullable=False,
        index=True,
    )

    test_step_id: Mapped[int] = mapped_column(
        ForeignKey("test_steps.id"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    duration_ms: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    screenshot_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )