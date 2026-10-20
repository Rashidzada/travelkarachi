"""
URL configuration for travelkarachi_backend project.
Serves Django Admin, REST API (/api/...), media files, and the React SPA (dist/index.html).
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponse
import mimetypes


def serve_spa(request, resource=""):
    """
    Serve static files from dist/ if they exist, otherwise serve dist/index.html
    for client-side routing.
    """
    dist_dir = settings.FRONTEND_DIST_DIR
    if resource:
        candidate = (dist_dir / resource).resolve()
        if str(candidate).startswith(str(dist_dir.resolve())) and candidate.is_file():
            content_type, _ = mimetypes.guess_type(str(candidate))
            return FileResponse(open(candidate, 'rb'), content_type=content_type or 'application/octet-stream')

    index_file = dist_dir / 'index.html'
    if index_file.is_file():
        return FileResponse(open(index_file, 'rb'), content_type='text/html')

    return HttpResponse(
        "<h2>AeroDesk Django Backend is running!</h2>"
        "<p>API is live at <a href='/api/dashboard/'>/api/dashboard/</a> and Admin at <a href='/admin/'>/admin/</a>.</p>"
        "<p>Run <code>npm run build</code> to build the React frontend into <code>dist/</code>.</p>",
        content_type="text/html",
    )


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?P<resource>.*)$', serve_spa),
]
