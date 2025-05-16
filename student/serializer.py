from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = "__all__"

class StudyChatboxSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())

    class Meta:
        model = StudyChatbox
        fields = "__all__"



class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = "__all__"


class FriendshipSerializer(serializers.ModelSerializer):
    sender = StudentSerializer()
    receiver = StudentSerializer()

    class Meta:
        model = Friendship
        fields = ['id', 'sender', 'receiver', 'status', 'created_at', 'updated_at']

class FriendshipHistorySerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    receiver = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    action_student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())

    class Meta:
        model = FriendshipHistory
        fields = ['id', 'sender', 'receiver', 'action', 'action_student', 'timestamp']
        read_only_fields = ['timestamp']

class GroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, queryset=Student.objects.all(), required=False)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'members', 'is_private', 'created_at', 'max_students']
        read_only_fields = ['created_at']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'event_title', 'event_description', 'start_datetime', 'end_datetime', 'recurring_rule', 'created_at', 'updated_at', 'participants', 'groups']

class DiscussionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discussion
        fields = "__all__"

class SavedStudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedStudyPlan
        fields = '__all__'

class DashboardModuleSerializer(serializers.ModelSerializer):
    saved_study_plan = SavedStudyPlanSerializer(read_only=True)

    class Meta:
        model = DashboardModule
        fields = ['id', 'title', 'student', 'saved_study_plan']



class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class WellnessChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessChat
        fields = "__all__"