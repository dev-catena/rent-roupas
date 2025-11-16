import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import MyItemsScreen from '../screens/MyItems/MyItemsScreen';
import AddItemScreen from '../screens/MyItems/AddItemScreen';
import EditItemScreen from '../screens/MyItems/EditItemScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ItemDetailScreen from '../screens/Item/ItemDetailScreen';
import RentRequestScreen from '../screens/Item/RentRequestScreen';
import MeasurementsScreen from '../screens/Profile/MeasurementsScreen';
import RentalsScreen from '../screens/Rentals/RentalsScreen';
import ChatsScreen from '../screens/Chat/ChatsScreen';
import ChatDetailScreen from '../screens/Chat/ChatDetailScreen';
import RegisterProfessionalScreen from '../screens/Professional/RegisterProfessionalScreen';
import EditProfessionalScreen from '../screens/Professional/EditProfessionalScreen';
import ProfessionalsListScreen from '../screens/Professional/ProfessionalsListScreen';
import RatingScreen from '../screens/Rating/RatingScreen';
import VirtualTryOnScreen from '../screens/VirtualTryOn/VirtualTryOnScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'Rent Roupa' }}
      />
      <Stack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ title: 'Detalhes da Peça' }}
      />
      <Stack.Screen 
        name="RentRequest" 
        component={RentRequestScreen}
        options={{ title: 'Solicitar Aluguel' }}
      />
      <Stack.Screen 
        name="VirtualTryOn" 
        component={VirtualTryOnScreen}
        options={{ title: 'Experimentação Virtual' }}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen}
        options={{ title: 'Buscar' }}
      />
      <Stack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ title: 'Detalhes da Peça' }}
      />
      <Stack.Screen 
        name="RentRequest" 
        component={RentRequestScreen}
        options={{ title: 'Solicitar Aluguel' }}
      />
      <Stack.Screen 
        name="VirtualTryOn" 
        component={VirtualTryOnScreen}
        options={{ title: 'Experimentação Virtual' }}
      />
    </Stack.Navigator>
  );
}

function MyItemsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyItemsMain" 
        component={MyItemsScreen}
        options={{ title: 'Minhas Peças' }}
      />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{ title: 'Adicionar Peça' }}
      />
      <Stack.Screen 
        name="EditItem" 
        component={EditItemScreen}
        options={{ title: 'Editar Peça' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen 
        name="Measurements" 
        component={MeasurementsScreen}
        options={{ title: 'Minhas Medidas' }}
      />
      <Stack.Screen 
        name="Rentals" 
        component={RentalsScreen}
        options={{ title: 'Meus Aluguéis' }}
      />
      <Stack.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{ title: 'Conversas' }}
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen 
        name="RegisterProfessional" 
        component={RegisterProfessionalScreen}
        options={{ title: 'Cadastro Profissional' }}
      />
      <Stack.Screen 
        name="EditProfessional" 
        component={EditProfessionalScreen}
        options={{ title: 'Editar Dados Profissionais' }}
      />
      <Stack.Screen 
        name="ProfessionalsList" 
        component={ProfessionalsListScreen}
        options={{ title: 'Profissionais' }}
      />
      <Stack.Screen 
        name="Rating" 
        component={RatingScreen}
        options={{ title: 'Avaliar' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyItems') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack}
        options={{ tabBarLabel: 'Buscar' }}
      />
      <Tab.Screen 
        name="MyItems" 
        component={MyItemsStack}
        options={{ tabBarLabel: 'Minhas Peças' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

