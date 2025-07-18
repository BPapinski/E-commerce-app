from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from store.models import Notification
from store.serializers import NotificationSerializer


class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        unread_notifications = list(Notification.objects.filter(user=user, is_read=False).order_by('-created_at'))
        unread_count = len(unread_notifications)

        if unread_count < 5:
            needed = 5 - unread_count
            additional = Notification.objects.filter(user=user).exclude(id__in=[n.id for n in unread_notifications]).order_by('-created_at')[:needed]
            notifications = unread_notifications + list(additional)
        else:
            notifications = unread_notifications

        serializer = NotificationSerializer(notifications, many=True)

        return Response({
            'unread_count': unread_count,
            'notifications': serializer.data
        })
        
class ReadNotificationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        updated = Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        return Response(
            {"message": f"{updated} notifications marked as read"},
            status=200
        )

