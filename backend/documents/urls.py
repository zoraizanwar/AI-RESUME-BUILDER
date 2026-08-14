from django.urls import path
from .views import GenerateDocumentView, DownloadDocumentView, UploadPDFDocumentView

urlpatterns = [
    path('generate/', GenerateDocumentView.as_view(), name='generate-document'),
    path('upload_pdf/', UploadPDFDocumentView.as_view(), name='upload-pdf'),
    path('download/<int:doc_id>/', DownloadDocumentView.as_view(), name='download-document'),
]
