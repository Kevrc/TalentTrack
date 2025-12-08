from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import UsuarioSerializer,UserProfileSerializer

# Forma correcta de referenciar al usuario activo
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse (para el MVP)

# Vista placeholder para Perfil (para que no falle la importación en urls.py)
class ProfileView(generics.RetrieveAPIView): # Cambiamos a RetrieveAPIView (solo lectura por ahora)
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer # Usamos el serializer detallado

    def get_object(self):
        return self.request.user