from django.http import JsonResponse, response
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializer import *
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from .models import *
from .ai_utils import generate_study_plan, wellness_chatbot_response
from django.db import models
from django.db import models
from rest_framework.authtoken.models import Token
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from .ai_utils import generate_study_plan, wellness_chatbot_response
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# Create your views here.




class Index(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "Hello from Django!"})

    
@method_decorator(csrf_exempt, name='dispatch')



class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]  

    def list(self, request):
        """Get all events"""
        events = self.get_queryset()
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new event"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get a specific event"""
        event = self.get_object()
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update an event"""
        event = self.get_object()
        serializer = self.get_serializer(event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete an event"""
        event = self.get_object()
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            password = serializer.validated_data.get("password")
            try:
                validate_password(password)
            except ValidationError as e:
                return Response({"password": e.messages}, status=status.HTTP_400_BAD_REQUEST)

            # Save user after passing validation
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Registration successful",
                "token": token.key
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key
            }, status=200)
        return Response({"error": "Invalid credentials"}, status=400)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successful"}, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

class LogoutView(APIView):
    """User logout view"""

    permission_classes = [AllowAny]



    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)




class GetUserAndStudentDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        try:
            student = user.student 
        except Student.DoesNotExist:
            return Response({"error": "No student profile linked."}, status=404)

        return Response({
            "user": {
                "id": user.id,
                "username": user.username
            },
            "student": StudentSerializer(student).data
        }, status=200)


# An admin method to be implemented later
class GetAllStudents(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        students = Student.objects.all()
        student_serializer = StudentSerializer(students, many=True)
        return Response({"message": "All students fetched successfully", "data": student_serializer.data})


class GetStudent(APIView):
    permission_classes = [AllowAny]

    def get(self,request,id):
        student = Student.objects.get(id=id)
        student_serializer = StudentSerializer(student)
        response_data = {
            "student" : student_serializer.data,
            "message" : "Student details fetched successfully"
        }
        return Response(response_data)




# class GetStudent(APIView):
#     def get(self, request, id):
#         student = Student.objects.get(id=id)
#         student_serializer = StudentSerializer(student)
#         response_data = {
#             "student": student_serializer.data,
#             "message": "Student details fetched successfully"
#         }
        
#         return Response(response_data)



class CreateStudent(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'student'):
            return Response({"error": "Student profile already exists for this user."}, status=400)

        student_data = request.data.copy()
        student_data["user"] = request.user.id  

        serializer = StudentSerializer(data=student_data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Student created", "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)


class UpdateStudent(APIView): 
    def put(self, request, id):

        student = Student.objects.get(id=id)
        student_serializer = StudentSerializer(student, data=request.data)
        if student_serializer.is_valid():
            student_serializer.save()
            return Response({"message": "Student updated successfully", "data": student_serializer.data},
             status=200)
        return Response({"message": "Failed to update student"}, status=400)



class DeleteStudent(APIView):
    permission_classes = [AllowAny]

    def delete(self,request,id):
        student = Student.objects.get(id=id)
        student.delete()
        return Response({"message" : "Student deleted successfully"}, status=200)

    
@method_decorator(csrf_exempt, name='dispatch')
class SendFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user.student
        receiver_id = request.data.get("receiver_id")

        if not receiver_id:
            return Response({"error": "Receiver ID is required"}, status=400)

        if sender.id == receiver_id:
            return Response({"error": "Cannot send friend request to yourself"}, status=400)

        try:
            receiver = Student.objects.get(id=receiver_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        existing = Friendship.objects.filter(
            models.Q(sender=sender, receiver=receiver) | models.Q(sender=receiver, receiver=sender)
        ).first()

        if existing:
            if existing.status == "blocked":
                return Response({"error": "Student is blocked"}, status=403)
            if existing.status == "rejected":
                existing.delete()
            else:
                return Response({"error": "Friendship already exists"}, status=400)

        friendship = Friendship.objects.create(sender=sender, receiver=receiver)
        FriendshipHistory.objects.create(student=receiver, action_student_id=sender.id, action="sent_request")
        return Response({"message": "Friend request sent"}, status=201)


@method_decorator(csrf_exempt, name='dispatch')
class RespondToFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        student = request.user.student
        action = request.data.get("action")

        if action not in ["accepted", "rejected"]:
            return Response({"error": "Invalid action"}, status=400)

        try:
            friendship = Friendship.objects.get(id=friendship_id)
        except Friendship.DoesNotExist:
            return Response({"error": "Friendship not found"}, status=404)

        if friendship.receiver != student:
            return Response({"error": "Only the receiver can respond"}, status=403)

        if action == "rejected":
            FriendshipHistory.objects.create(student=student, action_student_id=friendship.sender.id, action="rejected_request")
            friendship.delete()
            return Response({"message": "Request rejected"}, status=200)

        friendship.status = "accepted"
        friendship.save()
        FriendshipHistory.objects.create(student=student, action_student_id=friendship.sender.id, action="accepted_request")
        return Response({"message": "Request accepted"}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class UnblockFriend(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        student = request.user.student

        try:
            friendship = Friendship.objects.get(id=friendship_id, status="blocked")
        except Friendship.DoesNotExist:
            return Response({"error": "Friendship not found or not blocked"}, status=404)

        if student not in [friendship.sender, friendship.receiver]:
            return Response({"error": "Unauthorized"}, status=403)

        friendship.delete()
        FriendshipHistory.objects.create(student=student, action_student_id=student.id, action="unblocked")
        return Response({"message": "Unblocked successfully"}, status=200)


class GetFriendships(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        friendships = Friendship.objects.filter(
            models.Q(sender=student) | models.Q(receiver=student)
        ).select_related('sender', 'receiver')

        data = [{
            'id': f.id,
            'sender': {'id': f.sender.id, 'name': f.sender.name},
            'receiver': {'id': f.receiver.id, 'name': f.receiver.name},
            'status': f.status,
            'created_at': f.created_at,
            'updated_at': f.updated_at
        } for f in friendships]

        return Response(data, status=200)

        
@method_decorator(csrf_exempt, name='dispatch')
class BlockFriend(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        student = request.user.student
        try:
            friendship = Friendship.objects.get(id=friendship_id)
        except Friendship.DoesNotExist:
            return Response({"error": "Friendship not found"}, status=404)

        if student not in [friendship.sender, friendship.receiver]:
            return Response({"error": "Unauthorized"}, status=403)

        blocker = student
        blocked = friendship.receiver if friendship.sender == student else friendship.sender

        friendship.sender = blocker
        friendship.receiver = blocked
        friendship.status = "blocked"
        friendship.save()

        return Response({"message": "Blocked user successfully"}, status=200)




class GetBlockedUsers(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        blocked = Friendship.objects.filter(
            Q(sender=student) | Q(receiver=student),
            status='blocked'
        ).select_related('sender', 'receiver')

        data = []
        for f in blocked:
            if f.sender == student:
                blocked_user = f.receiver
            else:
                blocked_user = f.sender

            data.append({
                'friendship_id': f.id,
                'id': blocked_user.id,
                'name': blocked_user.name,
                'email': blocked_user.email,
            })

        return Response(data, status=200)


        
class DeleteFriendship(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, friendship_id):
        try:
            friendship = Friendship.objects.get(id=friendship_id)
            if request.user.student not in [friendship.sender, friendship.receiver]:
                return Response({"error": "Unauthorized"}, status=403)
            friendship.delete()
            return Response({"message": "Deleted successfully"}, status=200)
        except Friendship.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


# Deck views
class GetAllDecks(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        decks = Deck.objects.all()
        deck_serializer = DeckSerializer(decks, many=True)
        return Response({"message": "All decks fetched successfully", "data": deck_serializer.data})


class GetDecksByStudent(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        decks = Deck.objects.filter(owner__id=student_id)
        deck_serializer = DeckSerializer(decks, many=True)
        return Response({"message": f"Decks for student {student_id} fetched successfully", "data": deck_serializer.data})


class CreateDeck(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        deck_serializer = DeckSerializer(data=request.data)
        if deck_serializer.is_valid():
            deck_serializer.save()
            return Response({"message": "Deck created successfully", "data": deck_serializer.data}, status=201)
        return Response({"message": "Failed to create deck", "errors": deck_serializer.errors}, status=400)


class UpdateDeck(APIView):
    permission_classes = [AllowAny]

    def put(self, request, id):
        try:
            deck = Deck.objects.get(id=id)
            deck_serializer = DeckSerializer(deck, data=request.data)
            if deck_serializer.is_valid():
                deck_serializer.save()
                return Response({"message": "Deck updated successfully", "data": deck_serializer.data}, status=200)
            return Response({"message": "Failed to update deck", "errors": deck_serializer.errors}, status=400)
        except Deck.DoesNotExist:
            return Response({"message": "Deck not found"}, status=404)


class DeleteDeck(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, id):
        try:
            deck = Deck.objects.get(id=id)
            deck.delete()
            return Response({"message": "Deck deleted successfully"}, status=200)
        except Deck.DoesNotExist:
            return Response({"message": "Deck not found"}, status=404)


# Flashcard views
class GetAllFlashcards(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        flashcards = Flashcard.objects.all()
        flashcard_serializer = FlashcardSerializer(flashcards, many=True)
        return Response({"message": "All flashcards fetched successfully", "data": flashcard_serializer.data})


class GetFlashcardsByDeck(APIView):
    permission_classes = [AllowAny]

    def get(self, request, deck_id):
        flashcards = Flashcard.objects.filter(deck__id=deck_id)
        flashcard_serializer = FlashcardSerializer(flashcards, many=True)
        return Response({"message": f"Flashcards for deck {deck_id} fetched successfully", "data": flashcard_serializer.data})


class CreateFlashcard(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        flashcard_serializer = FlashcardSerializer(data=request.data)
        if flashcard_serializer.is_valid():
            flashcard_serializer.save()
            return Response({"message": "Flashcard created successfully", "data": flashcard_serializer.data}, status=201)
        return Response({"message": "Failed to create flashcard", "errors": flashcard_serializer.errors}, status=400)


class UpdateFlashcard(APIView):
    permission_classes = [AllowAny]

    def put(self, request, id):
        try:
            flashcard = Flashcard.objects.get(id=id)
            flashcard_serializer = FlashcardSerializer(flashcard, data=request.data)
            if flashcard_serializer.is_valid():
                flashcard_serializer.save()
                return Response({"message": "Flashcard updated successfully", "data": flashcard_serializer.data}, status=200)
            return Response({"message": "Failed to update flashcard", "errors": flashcard_serializer.errors}, status=400)
        except Flashcard.DoesNotExist:
            return Response({"message": "Flashcard not found"}, status=404)


class DeleteFlashcard(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, id):
        try:
            flashcard = Flashcard.objects.get(id=id)
            flashcard.delete()
            return Response({"message": "Flashcard deleted successfully"}, status=200)
        except Flashcard.DoesNotExist:
            return Response({"message": "Flashcard not found"}, status=404)

class DeleteStudent(APIView): 
    def delete(self, request, id):
        student = Student.objects.get(id=id)
        student.delete()
        return Response({"message": "Student deleted successfully"}, status=200)


class GetAllDiscussions(APIView):
    """Get all discussions"""
    permission_classes = [AllowAny]
    def get(self, request):
        discussions = Discussion.objects.all()
        serializer = DiscussionSerializer(discussions, many=True)
        return Response({
            "message": "All discussions fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class GetDiscussion(APIView):
    """Get a specific discussion by ID"""
    permission_classes = [AllowAny]

    def get(self, request, id):
        try:
            discussion = Discussion.objects.get(id=id)
            serializer = DiscussionSerializer(discussion)
            return Response({
                "message": "Discussion fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Discussion.DoesNotExist:
            return Response({
                "message": "Discussion not found"
            }, status=status.HTTP_404_NOT_FOUND)


class CreateDiscussion(APIView):
    """Create a new discussion (simplified)"""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        student = Student.objects.get(id=request.data.get('author'))
        data['author'] = student.user.id

        serializer = DiscussionSerializer(data=data)
        serializer.is_valid(raise_exception=True)  # Automatically raises 400 if invalid
        serializer.save()

        return Response({
            "message": "Discussion created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class UpdateDiscussion(APIView):
    """Update a discussion (simplified)"""
    permission_classes = [AllowAny]

    def put(self, request, id):
        discussion = Discussion.objects.get(id=id)
        serializer = DiscussionSerializer(discussion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)  # Automatically raises 400 if invalid
        serializer.save()

        return Response({
            "message": "Discussion updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class DeleteDiscussion(APIView):
    """Delete a discussion (simplified)"""
    permission_classes = [AllowAny]

    def delete(self, request, id):
        discussion = Discussion.objects.get(id=id)
        discussion.delete()

        return Response({
            "message": "Discussion deleted successfully"
        }, status=status.HTTP_200_OK)



    
# StudyChatbox Views# StudyChatbox Views
class GetAllChatMessages(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = StudyChatbox.objects.all().order_by('timestamp')
        serializer = StudyChatboxSerializer(chats, many=True)
        return Response({
            "message": "All chat messages fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class CreateChatMessage(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StudyChatboxSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Chat message created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Failed to create chat message",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class GetChatsByStudent(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        chats = StudyChatbox.objects.filter(student__id=student_id).order_by('timestamp')
        serializer = StudyChatboxSerializer(chats, many=True)
        return Response({
            "message": f"Chats for student {student_id} fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class DeleteChatMessage(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            chat = StudyChatbox.objects.get(id=id)
            delete_type = request.data.get('delete_type')  # 'user_message' or 'bot_response'
            
            if delete_type == 'user_message':
                chat.user_message = ""  # Clear user message but keep bot response
                chat.save()
                return Response({"message": "User message cleared successfully"}, status=status.HTTP_200_OK)
            elif delete_type == 'bot_response':
                chat.bot_response = ""  # Clear bot response but keep user message
                chat.save()
                return Response({"message": "Bot response cleared successfully"}, status=status.HTTP_200_OK)
            else:
                # Default behavior - delete entire chat record
                chat.delete()
                return Response({"message": "Chat message deleted successfully"}, status=status.HTTP_200_OK)
                
        except StudyChatbox.DoesNotExist:
            return Response({"error": "Chat message not found"}, status=status.HTTP_404_NOT_FOUND)




class StudyPlanView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({"error": "Missing prompt"}, status=400)
        try:
            study_plan = generate_study_plan(prompt)
            return Response({"message": "Study plan generated successfully", "data": study_plan}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# class CreateWellnessSession(APIView):
#     def post(self, request):
#         title = request.data.get("title", "New Chat")
#         session = WellnessChatSession.objects.create(title=title)
#         serializer = WellnessChatSessionSerializer(session)
#         return Response(serializer.data, status=201)


# class CreateWellnessSession(APIView):
#     def post(self, request):
#         title = request.data.get("title", "New Chat")
#         session = WellnessChatSession.objects.create(title=title)
#         serializer = WellnessChatSessionSerializer(session)
#         return Response(serializer.data, status=201)


# class GetAllWellnessSessions(APIView):
#     def get(self, request):
#         sessions = WellnessChatSession.objects.all().order_by("-created_at")
#         serializer = WellnessChatSessionSerializer(sessions, many=True)
#         return Response(serializer.data)


# class WellnessChatboxView(APIView):
#     def post(self, request):
#         user_msg = request.data.get("query")
#         session_id = request.data.get("session_id")

#         if not user_msg or not session_id:
#             return Response({"error": "Missing query or session_id"}, status=400)

#         try:
#             session = WellnessChatSession.objects.get(id=session_id)
#         except WellnessChatSession.DoesNotExist:
#             return Response({"error": "Invalid session_id"}, status=404)

#         try:
#             bot_reply = wellness_chatbot_response(user_msg)

#             chat = WellnessChatbox.objects.create(
#                 session=session,
#                 user_message=user_msg,
#                 bot_response=bot_reply,
#                 timestamp=now()
#             )

#             return Response({
#                 "message": "Response generated successfully.",
#                 "data": bot_reply
#             }, status=200)

#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

class WellnessChatboxView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_query = request.data.get('query')
        if not user_query:
            return Response({"error": "Missing query"}, status=400)
        try:
            response = wellness_chatbot_response(user_query)
            return Response({"message": "Response generated successfully", "data": response}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class GetAllWellnessChats(APIView):
    """Fetch all wellness chat messages"""
    permission_classes = [AllowAny]

    def get(self, request):
        chats = WellnessChat.objects.all()
        serializer = WellnessChatSerializer(chats, many=True)
        return Response({
            "message": "All wellness chat messages fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class GetWellnessChatsByStudent(APIView):
    """Fetch wellness chat messages for a specific student"""
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        chats = WellnessChat.objects.filter(student__id=student_id)
        serializer = WellnessChatSerializer(chats, many=True)
        return Response({
            "message": f"Chats for student {student_id} fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class CreateWellnessChatMessage(APIView):
    """Create a new wellness chat message"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WellnessChatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Wellness chat message created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Failed to create wellness chat message",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
class SaveStudyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        plan_content = request.data.get("plan_content")
        module_id = request.data.get("module_id")

        if not plan_content or not module_id:
            return Response({"error": "plan_content and module_id required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module = DashboardModule.objects.get(id=module_id, student=student)
        except DashboardModule.DoesNotExist:
            return Response({"error": "Invalid module ID"}, status=status.HTTP_404_NOT_FOUND)

        study_plan = SavedStudyPlan.objects.create(
            student=student,
            plan_content=plan_content,
            status='saved'
        )
        module.saved_study_plan = study_plan
        module.save()

        serializer = SavedStudyPlanSerializer(study_plan)
        return Response({"message": "Saved to module", "data": serializer.data}, status=status.HTTP_201_CREATED)


class ApproveStudyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, plan_id):
        student = request.user.student
        try:
            study_plan = SavedStudyPlan.objects.get(id=plan_id, student=student)
        except SavedStudyPlan.DoesNotExist:
            return Response({"error": "Study plan not found."}, status=status.HTTP_404_NOT_FOUND)

        study_plan.status = 'saved'
        study_plan.save()
        serializer = SavedStudyPlanSerializer(study_plan)
        return Response({
            "message": "Study plan approved successfully.",
            "data": serializer.data
        }, status=200)

class SavedStudyPlanListView(APIView):
    """
    Returns all saved study plans for the logged-in student. 
    The dashboard will use this to list available study plans for linking.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        study_plans = SavedStudyPlan.objects.filter(student=student)
        serializer = SavedStudyPlanSerializer(study_plans, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    
class DashboardModuleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        modules = DashboardModule.objects.filter(student=student, is_active=True)
        serializer = DashboardModuleSerializer(modules, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class AvailableDashboardModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student
        modules = DashboardModule.objects.filter(student=student, is_active=False)
        serializer = DashboardModuleSerializer(modules, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)



class CreateDashboardModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        data = request.data.copy()
        data['student'] = student.id  
        serializer = DashboardModuleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Module created successfully", "data": serializer.data}, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleDashboardModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, module_id):
        student = request.user.student
        try:
            module = DashboardModule.objects.get(id=module_id, student=student)
            module.is_active = not module.is_active
            module.save()
            return Response({"message": "Module toggled", "data": DashboardModuleSerializer(module).data}, status=status.HTTP_200_OK)
        except DashboardModule.DoesNotExist:
            return Response({"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND)
        
class GetDashboardModuleByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        student = request.user.student
        try:
            module = DashboardModule.objects.get(pk=pk, student=student)
            serializer = DashboardModuleSerializer(module)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except DashboardModule.DoesNotExist:
            return Response({"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND)

class CreateLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user.student
        data = request.data.copy()

        if "dashboard_module" not in data:
            return Response({"error": "Dashboard Module ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module = DashboardModule.objects.get(id=data['dashboard_module'], student=student)
        except DashboardModule.DoesNotExist:
            return Response({"error": "Invalid or unauthorized module ID."}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Lesson created successfully", "data": serializer.data}, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListLessonsByModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, module_id):
        student = request.user.student
        try:
            module = DashboardModule.objects.get(id=module_id, student=student)
        except DashboardModule.DoesNotExist:
            return Response({"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND)

        lessons = Lesson.objects.filter(dashboard_module=module)
        serializer = LessonSerializer(lessons, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)



class LessonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            lesson = Lesson.objects.get(id=pk, dashboard_module__student=request.user.student)
            serializer = LessonSerializer(lesson)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            lesson = Lesson.objects.get(id=pk, dashboard_module__student=request.user.student)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Lesson updated", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UpdateWellnessChatMessage(APIView):
    """Update a specific wellness chat message by ID"""
    permission_classes = [AllowAny]

    def put(self, request, id):
        try:
            chat = WellnessChat.objects.get(id=id)
        except WellnessChat.DoesNotExist:
            return Response({"error": "Chat message not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = WellnessChatSerializer(chat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Wellness chat message updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "message": "Failed to update wellness chat message",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteWellnessChatMessage(APIView):
    """Delete a specific wellness chat message by ID"""
    permission_classes = [AllowAny]

    def delete(self, request, id):
        try:
            chat = WellnessChat.objects.get(id=id)
            chat.delete()
            return Response({"message": "Wellness chat message deleted successfully"}, status=status.HTTP_200_OK)
        except WellnessChat.DoesNotExist:
            return Response({"error": "Chat message not found"}, status=status.HTTP_404_NOT_FOUND)


# class GetChatHistoryBySession(APIView):
#     def get(self, request, session_id):
#         try:
#             session = WellnessChatSession.objects.get(id=session_id)
#             chats = session.messages.order_by("timestamp")
#             serializer = WellnessChatboxSerializer(chats, many=True)
#             return Response(serializer.data, status=200)
#         except WellnessChatSession.DoesNotExist:
#             return Response({"error": "Invalid session_id"}, status=404)


class CreateGroup(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        student_id = request.data.get('student_id')
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({
                "message": "Student not found",
            }, status=status.HTTP_400_BAD_REQUEST)
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save()
            members = request.data.get('members', [])
            if members:
                group.members.add(*members)
            if student.id not in members:
                group.members.add(student)
            return Response({
                "message": "Group created successfully",
                "data": GroupSerializer(group).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Failed to create group",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)



class GetAllGroups(APIView):
    """Get all groups"""
    permission_classes = [AllowAny]

    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response({
            "message": "All groups fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class GetGroupById(APIView):
    """Get details of a specific group by ID"""
    permission_classes = [AllowAny]

    def get(self, request, group_id):
        group = Group.objects.filter(id=group_id).first()
        if group:
            serializer = GroupSerializer(group)
            return Response({
                "message": "Group fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "message": "Group not found"
        }, status=status.HTTP_404_NOT_FOUND)


class UpdateGroup(APIView):
    """Update an existing group"""
    permission_classes = [AllowAny]

    def put(self, request, group_id):
        group = Group.objects.filter(id=group_id).first()
        if not group:
            return Response({
                "message": "Group not found"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Group updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "message": "Failed to update group",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteGroup(APIView):
    """Delete a group by ID"""
    permission_classes = [AllowAny]

    def delete(self, request, group_id):
        group = Group.objects.filter(id=group_id).first()
        if not group:
            return Response({
                "message": "Group not found"
            }, status=status.HTTP_404_NOT_FOUND)

        group.delete()
        return Response({"message": "Group deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class AddGroupMember(APIView):
    """Add a member to a group"""
    permission_classes = [AllowAny]

    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response({
                    "message": "student_id is required"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                student = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                return Response({
                    "message": "Student not found"
                }, status=status.HTTP_404_NOT_FOUND)
                
            if group.members.filter(id=student_id).exists():
                return Response({
                    "message": "Student is already a member of this group"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            group.members.add(student)
            return Response({
                "message": "Member added successfully",
                "data": {
                    "group_id": group.id,
                    "student_id": student.id
                }
            }, status=status.HTTP_200_OK)
            
        except Group.DoesNotExist:
            return Response({
                "message": "Group not found"
            }, status=status.HTTP_404_NOT_FOUND)

class RemoveGroupMember(APIView):
    """Remove a member from a group"""
    permission_classes = [AllowAny]

    def delete(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response({
                    "message": "student_id is required"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                student = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                return Response({
                    "message": "Student not found"
                }, status=status.HTTP_404_NOT_FOUND)
                
            if not group.members.filter(id=student_id).exists():
                return Response({
                    "message": "Student is not a member of this group"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            group.members.remove(student)
            return Response({
                "message": "Member removed successfully",
                "data": {
                    "group_id": group.id,
                    "student_id": student.id
                }
            }, status=status.HTTP_200_OK)
            
        except Group.DoesNotExist:
            return Response({
                "message": "Group not found"
            }, status=status.HTTP_404_NOT_FOUND)

class GetGroupMembers(APIView):
    """Get all members of a group"""
    permission_classes = [AllowAny]

    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            members = group.members.all()
            serializer = StudentSerializer(members, many=True)
            return Response({
                "message": "Group members fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Group.DoesNotExist:
            return Response({
                "message": "Group not found"
            }, status=status.HTTP_404_NOT_FOUND)
        

class GetStudyPlanForModule(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, module_id):
        try:
            plan = SavedStudyPlan.objects.get(module__id=module_id)
            return Response({"plan_content": plan.plan_content})
        except SavedStudyPlan.DoesNotExist:
            return Response({"plan_content": ""})

