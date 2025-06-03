

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('grappelli/', include('grappelli.urls')),
    path('nested_admin/', include('nested_admin.urls')),
    path('admin/', admin.site.urls),
    path('', include('authuser.urls')),  # <- to musi być!
    path('api/store/', include('store.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)