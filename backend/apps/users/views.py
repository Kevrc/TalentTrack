from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import UsuarioSerializer, UserProfileSerializer, CompletarPerfilSerializer

# Forma correcta de referenciar al usuario activo
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse (para el MVP)

# Vista placeholder para Perfil (para que no falle la importación en urls.py)
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def completar_perfil_inicial(self, request):
        """
        Endpoint para completar el perfil en el primer login
        POST /api/users/profile/completar_perfil_inicial/
        """
        usuario = request.user
        
        # Verificar si ya completó el perfil
        if usuario.primer_login_completado:
            return Response(
                {"detail": "El perfil ya fue completado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CompletarPerfilSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            # Marcar como completado
            usuario = serializer.save()
            usuario.primer_login_completado = True
            usuario.fecha_primer_login = timezone.now()
            usuario.save()
            
            return Response(
                {
                    "detail": "Perfil completado exitosamente",
                    "usuario": UserProfileSerializer(usuario).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
