import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../constants/colors';
import * as Location from 'expo-location';
import SafeIcon from '../../components/SafeIcon';

// Função para converter nome do estado para sigla
function getStateAbbreviation(stateName) {
  const stateMap = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO'
  };
  
  // Se já é uma sigla (2 letras), retorna como está
  if (stateName && stateName.length === 2) {
    return stateName.toUpperCase();
  }
  
  // Retorna a sigla ou o valor original se não encontrar
  return stateMap[stateName] || stateName || '';
}

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Dados básicos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userType, setUserType] = useState('renter');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Dados profissionais (se userType === 'professional')
  const [professionalType, setProfessionalType] = useState('seamstress');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [workshopAddress, setWorkshopAddress] = useState('');
  const [workshopLocation, setWorkshopLocation] = useState(null);

  // Localização
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [location, setLocation] = useState(null);

  async function getCurrentLocation() {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização para encontrar peças próximas');
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      
      // Faz geocoding reverso para obter o endereço
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode) {
        // Monta o endereço completo
        const streetAddress = [
          geocode.street,
          geocode.streetNumber,
        ].filter(Boolean).join(', ');
        
        setAddress(streetAddress || geocode.name || '');
        setCity(geocode.city || '');
        setState(getStateAbbreviation(geocode.region));
        setZipcode(geocode.postalCode || '');
        
        Alert.alert('Sucesso!', 'Localização e endereço obtidos automaticamente!');
      } else {
        Alert.alert('Sucesso', 'Localização obtida! (Endereço não encontrado)');
      }
      
      setLoadingLocation(false);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização: ' + error.message);
      setLoadingLocation(false);
    }
  }

  async function getWorkshopLocation() {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização');
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setWorkshopLocation(currentLocation.coords);
      
      // Faz geocoding reverso para obter o endereço
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode) {
        // Monta o endereço completo
        const streetAddress = [
          geocode.street,
          geocode.streetNumber,
        ].filter(Boolean).join(', ');
        
        setWorkshopAddress(streetAddress || geocode.name || '');
        setCity(geocode.city || '');
        setState(getStateAbbreviation(geocode.region));
        setZipcode(geocode.postalCode || '');
        
        Alert.alert('Sucesso!', 'Localização e endereço do ateliê obtidos automaticamente!');
      } else {
        Alert.alert('Sucesso', 'Localização do ateliê obtida! (Endereço não encontrado)');
      }
      
      setLoadingLocation(false);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização: ' + error.message);
      setLoadingLocation(false);
    }
  }

  function getTotalSteps() {
    return userType === 'professional' ? 3 : 2;
  }

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Validações para profissionais
    if (userType === 'professional') {
      if (!bio || !experience || !basePrice || !workshopAddress) {
        Alert.alert('Erro', 'Preencha todos os campos profissionais');
        return;
      }
    }

    setLoading(true);

    const userData = {
      name,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
      user_type: userType,
      address,
      city,
      state,
      zipcode,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    // Adiciona dados profissionais se for profissional
    if (userType === 'professional') {
      userData.professional_type = professionalType;
      userData.bio = bio;
      userData.years_of_experience = parseInt(experience) || 0;
      userData.base_price = parseFloat(basePrice) || 0;
      userData.availability = JSON.stringify(availability);
      userData.workshop_address = workshopAddress;
      userData.workshop_latitude = workshopLocation?.latitude;
      userData.workshop_longitude = workshopLocation?.longitude;
    }

    try {
      const result = await signUp(userData);
      setLoading(false);

      console.log('Resultado do signUp:', result);

      if (!result.success) {
        // Verifica se há erros de validação específicos
        if (result.errors && Object.keys(result.errors).length > 0) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          Alert.alert('Erro de validação', errorMessages);
        } else {
          Alert.alert('Erro', result.message || 'Não foi possível criar a conta');
        }
      } else {
        // Sucesso - o AuthContext já atualizou o estado, então a navegação acontece automaticamente
        console.log('Cadastro bem-sucedido! Navegando para a tela principal...');
      }
    } catch (error) {
      setLoading(false);
      console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.');
    }
  }

  function renderStep1() {
    return (
      <>
        <Text style={styles.stepTitle}>Dados Básicos</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <SafeIcon 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={20} 
                color={colors.gray} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite a senha novamente"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry={!showPasswordConfirmation}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            >
              <SafeIcon 
                name={showPasswordConfirmation ? 'eye' : 'eye-off'} 
                size={20} 
                color={colors.gray} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Como você vai usar o app? *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, userType === 'renter' && styles.radioButtonSelected]}
              onPress={() => setUserType('renter')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="person" 
                  size={20} 
                  color={userType === 'renter' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, userType === 'renter' && styles.radioTextSelected]}>
                  {' '}Alugar roupas
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, userType === 'owner' && styles.radioButtonSelected]}
              onPress={() => setUserType('owner')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="home" 
                  size={20} 
                  color={userType === 'owner' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, userType === 'owner' && styles.radioTextSelected]}>
                  {' '}Oferecer roupas
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, userType === 'both' && styles.radioButtonSelected]}
              onPress={() => setUserType('both')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="swap-horizontal" 
                  size={20} 
                  color={userType === 'both' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, userType === 'both' && styles.radioTextSelected]}>
                  {' '}Ambos
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, userType === 'professional' && styles.radioButtonSelected]}
              onPress={() => setUserType('professional')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="construct" 
                  size={20} 
                  color={userType === 'professional' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, userType === 'professional' && styles.radioTextSelected]}>
                  {' '}Como Profissional (Costureira/Alfaiate)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.nextButtonText}>Próximo</Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderStep2() {
    return (
      <>
        <Text style={styles.stepTitle}>Localização</Text>
        <Text style={styles.stepSubtitle}>
          Ajude-nos a encontrar peças e profissionais próximos a você
        </Text>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color={colors.darkGray} />
          ) : (
            <View style={styles.locationButtonContent}>
              <SafeIcon name="location" size={20} color={colors.darkGray} />
              <Text style={styles.locationButtonText}>
                {' '}{location ? 'Localização obtida ✓' : 'Obter localização atual'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={styles.input}
            placeholder="Rua, número"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 2 }]}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Cidade"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Estado</Text>
            <TextInput
              style={styles.input}
              placeholder="UF"
              value={state}
              onChangeText={setState}
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            style={styles.input}
            placeholder="00000-000"
            value={zipcode}
            onChangeText={setZipcode}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          {userType === 'professional' ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextButtonText}>Próximo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.registerButtonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }

  function renderStep3() {
    return (
      <>
        <Text style={styles.stepTitle}>Dados Profissionais</Text>
        <Text style={styles.stepSubtitle}>
          Complete seu cadastro como profissional
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Profissional *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, professionalType === 'seamstress' && styles.radioButtonSelected]}
              onPress={() => setProfessionalType('seamstress')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="construct" 
                  size={20} 
                  color={professionalType === 'seamstress' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, professionalType === 'seamstress' && styles.radioTextSelected]}>
                  {' '}Costureira
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, professionalType === 'tailor' && styles.radioButtonSelected]}
              onPress={() => setProfessionalType('tailor')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="construct" 
                  size={20} 
                  color={professionalType === 'tailor' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, professionalType === 'tailor' && styles.radioTextSelected]}>
                  {' '}Alfaiate
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, professionalType === 'stylist' && styles.radioButtonSelected]}
              onPress={() => setProfessionalType('stylist')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="shirt" 
                  size={20} 
                  color={professionalType === 'stylist' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, professionalType === 'stylist' && styles.radioTextSelected]}>
                  {' '}Estilista
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, professionalType === 'designer' && styles.radioButtonSelected]}
              onPress={() => setProfessionalType('designer')}
            >
              <View style={styles.radioContent}>
                <SafeIcon 
                  name="color-palette" 
                  size={20} 
                  color={professionalType === 'designer' ? colors.primary : colors.gray} 
                />
                <Text style={[styles.radioText, professionalType === 'designer' && styles.radioTextSelected]}>
                  {' '}Designer
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sobre Você *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conte sobre sua experiência e especialidades"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Anos de Experiência *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5"
            value={experience}
            onChangeText={setExperience}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preço Base (R$) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50.00"
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Endereço do Ateliê *</Text>
          <TextInput
            style={styles.input}
            placeholder="Endereço completo do seu ateliê"
            value={workshopAddress}
            onChangeText={setWorkshopAddress}
          />
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={getWorkshopLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color={colors.darkGray} />
          ) : (
            <View style={styles.locationButtonContent}>
              <SafeIcon name="location" size={20} color={colors.darkGray} />
              <Text style={styles.locationButtonText}>
                {' '}{workshopLocation ? 'Localização do ateliê obtida ✓' : 'Obter localização do ateliê'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dias Disponíveis</Text>
          <View style={styles.daysContainer}>
            {Object.keys(availability).map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, availability[day] && styles.dayButtonSelected]}
                onPress={() => setAvailability({...availability, [day]: !availability[day]})}
              >
                <Text style={[styles.dayText, availability[day] && styles.dayTextSelected]}>
                  {day === 'monday' ? 'Seg' :
                   day === 'tuesday' ? 'Ter' :
                   day === 'wednesday' ? 'Qua' :
                   day === 'thursday' ? 'Qui' :
                   day === 'friday' ? 'Sex' :
                   day === 'saturday' ? 'Sáb' : 'Dom'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonLink}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Passo {step} de {getTotalSteps()}</Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  backButtonLink: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  form: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.backgroundLight,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 16,
    color: colors.gray,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    color: colors.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  loginLinkText: {
    color: colors.gray,
    fontSize: 14,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff',
  },
  dayText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.primary,
  },
});

