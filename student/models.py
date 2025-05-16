from django.db import models
from django.utils.timezone import now
from enum import Enum
from django.contrib.auth.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, default="Unknown")
    email = models.EmailField(unique=True, max_length=100)
    course_name = models.CharField(max_length=100, default="Unknown")
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Deck(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="decks")
    def __str__(self):
        return self.name
    
class StudyCategory(Enum):
    FOCUS_MODE = "FOCUS_MODE"
    STUDY_PLANS = "STUDY_PLANS"
    STUDY_TECHNIQUES = "STUDY_TECHNIQUES"
    GENERAL = "GENERAL"
# --- Study Chatbox ---
class StudyChatbox(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="study_chatboxes", null=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    category = models.CharField(max_length=50, choices=[(tag.value, tag.name) for tag in StudyCategory])
    timestamp = models.DateTimeField(default=now)
    def __str__(self):
        return f"Chat - {self.student.name}"

class Flashcard(models.Model):
    front_text = models.TextField(max_length=1000)
    back_text = models.TextField(max_length=1000)
    difficulty_level = models.CharField(max_length=50, blank=True, null=True)
    times_reviewed = models.PositiveIntegerField(default=0)
    last_reviewed_date = models.DateTimeField(blank=True, null=True)
    created_date = models.DateTimeField(default=now)
    category = models.CharField(max_length=50, blank=True, null=True)
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="flashcards")
    def __str__(self):
        return f"Flashcard ({self.front_text[:30]}...)"
class Friendship(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("blocked", "Blocked"),
    ]
    sender = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="sent_relationships")
    receiver = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="received_relationships")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('sender', 'receiver')
    def clean(self):
        if self.sender == self.receiver:
            raise Exception("A student cannot have a relationship with themselves.")
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.sender.name} -> {self.receiver.name}"

class FriendshipHistory(models.Model):
    ACTION_CHOICES = [
        ("sent_request", "Sent Request"),
        ("accepted_request", "Accepted Request"),
        ("rejected_request", "Rejected Request"),
        ("blocked", "Blocked"),
        ("unblocked", "Unblocked"),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="friendship_history")
    action_student_id = models.IntegerField(default=0)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(default=now)
    def __str__(self):
        return f"{self.student.name} - {self.action}"

class Group(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(default=now)
    max_students = models.PositiveIntegerField()
    is_private = models.BooleanField(default=False)
    members = models.ManyToManyField(Student, related_name="groups")
    def __str__(self):
        return self.name

class Event(models.Model):
    event_title = models.CharField(max_length=255)
    event_description = models.TextField(blank=True, null=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    recurring_rule = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(Student, related_name="events", blank=True)
    groups = models.ManyToManyField(Group, related_name="events", blank=True)
    def __str__(self):
        return self.event_title

class Discussion(models.Model):
    author = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="discussions")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="discussions")
    message = models.TextField()
    timestamp = models.DateTimeField(default=now)
    def __str__(self):
        return f"Discussion by {self.author.name}"



class SavedStudyPlan(models.Model):
    STATUS_CHOICES = (
        ('unsaved', 'Unsaved'),
        ('saved', 'Saved'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="saved_study_plans")
    plan_content = models.TextField(help_text="Final approved study plan", blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unsaved')
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Study Plan for {self.student.name} ({self.status})"

class DashboardModule(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="dashboard_modules")
    title = models.CharField(max_length=200)
    saved_study_plan = models.ForeignKey(SavedStudyPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name="dashboard_modules")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.title.upper()

class Lesson(models.Model):
    dashboard_module = models.ForeignKey(DashboardModule, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.title.upper()

      
# #Alag's wellnessmodels    
# class WellnessChatSession(models.Model):
#     title = models.CharField(max_length=100, default="Untitled Session")
#     created_at = models.DateTimeField(default=now)

#     def __str__(self):
#         return self.title


# class WellnessChatbox(models.Model):
#     session = models.ForeignKey(WellnessChatSession, on_delete=models.CASCADE, related_name="messages")
#     user_message = models.TextField(max_length=500)
#     bot_response = models.TextField(max_length=500)
#     timestamp = models.DateTimeField(default=now)

#     def __str__(self):
#         return f"{self.user_message[:30]}..."

#Heng Wellness model
class WellnessChat(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, 
              related_name="wellness_chat", null=True)
    message = models.TextField()
    timestamp = models.DateTimeField(default=now)
    is_bot = models.BooleanField(default=False) 
    def __str__(self):
        return f"Chat - {self.student.name}"


