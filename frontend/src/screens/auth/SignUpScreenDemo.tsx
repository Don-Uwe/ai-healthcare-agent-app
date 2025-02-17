

/*

<SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{flex: 0, backgroundColor: PRIMARY_COLOR}}
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}>
        <AntIcon name="arrowleft" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>He who has health has hope and he</Text>
        <Text style={styles.title}>who has hope has everything.</Text>
        <Text style={styles.subtitle}> ~ Arabian Proverb.</Text>
      </View>

      <View style={styles.footer}>
        <ScrollView>
          <TouchableOpacity onPress={selectImage} style={styles.iconContainer}>
            {user_profile_image === '' ? (
              <Icon name="person-add" size={70} color="#0CAFFF" />
            ) : (
              <Image
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                  resizeMode: 'cover',
                }}
                source={{uri: user_profile_image}}
              />
            )}
          </TouchableOpacity>
          <View style={styles.form}>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={setName}
                value={name}
              />
              <View style={styles.inputIcon}>
                <Icon name="person" size={20} color="#000" />
              </View>
            </View>

            {!isHandleAvailable && (
              <Text style={styles.error}>User handle is already in use.</Text>
            )}
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="User Handle"
                value={username}
                onChangeText={handleUserHandleChange}
              />

              <View style={styles.inputIcon2}>
                <Icon name="person" size={20} color="#000" />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
              />
              <View style={styles.inputIcon}>
                <Icon name="email" size={20} color="#000" />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={isSecureEntry}
              />
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={() => setIsSecureEntry(!isSecureEntry)}>
                <AntDesign
                  name={isSecureEntry ? 'eyeo' : 'eye'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                data={data}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select your role' : '...'}
                value={role}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setRole(item.value);
                  setIsFocus(false);
                }}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {role === 'general' ? 'Register' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>

          <EmailVerifiedModal
            visible={verifiedModalVisible}
            onClick={handleVerifyModalCallback}
            onClose={() => {
              if (verifyBtntext !== 'Request Verification') {
                setVerifiedModalVisible(false);
              }
            }}
            message={verifyBtntext}
          />
        </ScrollView>
      </View>
    </SafeAreaView>


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: hp(25),
    paddingTop: 4,
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  footer: {
    flex: 1,
    width: '90%',
    paddingTop: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: -60,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  form: {
    padding: 10,
  },
  field: {},
  input: {
    height: 40,
    //width:'98%',
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    marginBottom: 20,
    fontSize: 15,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  inputIcon2: {
    position: 'absolute',
    right: 14,
    top: 8,
  },
  button: {
    backgroundColor: '#0CAFFF',
    padding: 10,
    borderRadius: 40,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '90%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  dropdown: {
    height: 40,
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingRight: 12,
  },
  placeholderStyle: {
    fontSize: 15,
  },
});
*/