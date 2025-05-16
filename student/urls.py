from django.urls import path, include
from student.views import *
from rest_framework.routers import DefaultRouter
from .views import (
    GetAllChatMessages,
    CreateChatMessage,
    GetChatsByStudent,
    DeleteChatMessage
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('',Index.as_view(), name = "index"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',LoginView.as_view(),name="login"),
    path('logout/',LogoutView.as_view(),name="logout"),
    path('reset-password/', ResetPasswordView.as_view(), name="reset_password"),
    # Student URLs
    path('get_user_and_student_details/', GetUserAndStudentDetails.as_view(), name='get_user_and_student_details'),
    path('create_student/',CreateStudent.as_view(),name="create_student"),
    path('update_student/<int:id>/',UpdateStudent.as_view(),name="update_student"),
    path('delete_student/<int:id>/',DeleteStudent.as_view(),name="delete_student"),
    path('get_all_students/',GetAllStudents.as_view(),name="get_all_students"),

    # Dashboard URLS 
    path('dashboard-modules/', DashboardModuleListView.as_view(), name='dashboard_modules'),
    path('dashboard-modules/available/', AvailableDashboardModuleView.as_view(), name='available_dashboard_modules'),
    path('dashboard-modules/create/', CreateDashboardModuleView.as_view(), name='create_dashboard_module'),
    path('dashboard-modules/toggle/<int:module_id>/', ToggleDashboardModuleView.as_view(), name='toggle_dashboard_module'),
    path('dashboard-modules/<int:pk>/', GetDashboardModuleByIdView.as_view(), name='get_dashboard_module_by_id'),
    path("modules/<int:module_id>/study-plan/", GetStudyPlanForModule.as_view(), name="get_study_plan_for_module"),
    path('lessons/create/', CreateLessonView.as_view(), name='create_lesson'),
    # Lessons URLS 
    path('lessons/module/<int:module_id>/', ListLessonsByModuleView.as_view(), name='list_lessons_by_module'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson_detail'),


    # Friendship URLs
    path('friendship/send/', SendFriendRequest.as_view(), name="send_friend_request"),
    path('friendship/respond/<int:friendship_id>/', RespondToFriendRequest.as_view(), name="respond_friend_request"),
    path('friendship/block/<int:friendship_id>/', BlockFriend.as_view(), name="block_friend"),
    path('friendship/', GetFriendships.as_view(), name="get_friendships"),
    path("friendship/get_blocked/", GetBlockedUsers.as_view()),
    path('friendship/unblock/<int:friendship_id>/', UnblockFriend.as_view(), name="unblock_friend"),
    path('friendship/delete/<int:friendship_id>/', DeleteFriendship.as_view(), name='delete_friendship'),


    # Deck URLs
    path('decks/', GetAllDecks.as_view(), name="get_all_decks"),
    path('decks/student/<int:student_id>/', GetDecksByStudent.as_view(), name="get_decks_by_student"),
    path('decks/create/', CreateDeck.as_view(), name="create_deck"),
    path('decks/update/<int:id>/', UpdateDeck.as_view(), name="update_deck"),
    path('decks/delete/<int:id>/', DeleteDeck.as_view(), name="delete_deck"),
    
    # Flashcard URLs
    path('flashcards/', GetAllFlashcards.as_view(), name="get_all_flashcards"),
    path('flashcards/deck/<int:deck_id>/', GetFlashcardsByDeck.as_view(), name="get_flashcards_by_deck"),
    path('flashcards/create/', CreateFlashcard.as_view(), name="create_flashcard"),
    path('flashcards/update/<int:id>/', UpdateFlashcard.as_view(), name="update_flashcard"),
    path('flashcards/delete/<int:id>/', DeleteFlashcard.as_view(), name="delete_flashcard"),

    path('study_plan/', StudyPlanView.as_view(), name='study_plan'),
    
    # Discussion URLs
    path('discussions/', GetAllDiscussions.as_view(), name="get_all_discussions"),
    path('create_discussion/', CreateDiscussion.as_view(), name="create_discussion"),
    path('get_discussion_by_id/<int:id>/', GetDiscussion.as_view(), name="get_discussion"),
    path('update_discussion/<int:id>/', UpdateDiscussion.as_view(), name="update_discussion"),
    path('delete_discussion/<int:id>/', DeleteDiscussion.as_view(), name="delete_discussion"),
    path('study-plans/save/', SaveStudyPlanView.as_view(), name='save_study_plan'),
    path('study-plans/approve/<int:plan_id>/', ApproveStudyPlanView.as_view(), name='approve_study_plan'),
    path('study-plans/', SavedStudyPlanListView.as_view(), name='saved_study_plans'),
    



    # Study Chatbox URLs
    path('studychatbox/all/', GetAllChatMessages.as_view(), name='get-all-chats'),  # GET only
    path('studychatbox/create/', CreateChatMessage.as_view(), name='create-chat-message'),  # POST only
    path('studychatbox/student/<int:student_id>/', GetChatsByStudent.as_view(), name='get-chats-by-student'),
    path('studychatbox/delete/<int:id>/', DeleteChatMessage.as_view(), name='delete_chat_message'),

    
    # Group URLs
    path('create_group/', CreateGroup.as_view(), name='create-group'),  
    path('groups/', GetAllGroups.as_view(), name='get_all_groups'), 
    path('get_group_by_id', GetGroupById.as_view(), name='get_group_by_id'), 
    path('update_group/<int:group_id>/', UpdateGroup.as_view(), name='update-group'), 
    path('delete_group/<int:group_id>/', DeleteGroup.as_view(), name='delete-group'),

    path('add_member/<int:group_id>/', AddGroupMember.as_view()),
    path('remove_member/<int:group_id>/', RemoveGroupMember.as_view()),
    path('group_members/<int:group_id>/', GetGroupMembers.as_view()), # Check members for a group 

    # WellnessChatbox URLs (heng)
    path('wellness_chats/', GetAllWellnessChats.as_view(), name="get_all_wellness_messages"),  
    path('wellness_create/', CreateWellnessChatMessage.as_view(), name="create_wellness_message"), 
    path('wellness_message/<int:student_id>/', GetWellnessChatsByStudent.as_view(), name="get_wellness_messages_by_discussion"), 
    path('wellness_update/<int:id>/', UpdateWellnessChatMessage.as_view(), name="update_wellness_message"), 
    path('wellness_delete/<int:id>/', DeleteWellnessChatMessage.as_view(), name="delete_wellness_message"),  
    path("wellness/", WellnessChatboxView.as_view(), name="wellness-chat"),
    # AI response api & URL to be written by Fatima (Done and added - Fatima)
]

urlpatterns += router.urls



