import Tts from "react-native-tts";
import { Platform } from "react-native";

type SupportedLang = "en-IN" | "hi-IN" | "bn-IN" | "ta-IN";

class MultiLanguageTTSService {
  private currentVoiceId: string | null = null;

  async init() {
    await Tts.getInitStatus();
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }

  async stop() {
    await Tts.stop();
  }

  async getAvailableVoice(lang: SupportedLang) {
    const voices = await Tts.voices();

    return voices.find(
      (v) =>
        v.language === lang &&
        !v.notInstalled &&
        !v.networkConnectionRequired
    );
  }

  async ensureLanguage(lang: SupportedLang): Promise<boolean> {
    const voice = await this.getAvailableVoice(lang);

    if (voice) {
      this.currentVoiceId = voice.id;
      await Tts.setDefaultVoice(voice.id);
      return true;
    }

    // Not installed
    if (Platform.OS === "android") {
      Tts.requestInstallData();
    }

    return false;
  }

  async speak(text: string, lang: SupportedLang) {
    await this.stop();

    const ready = await this.ensureLanguage(lang);

    if (!ready) {
      console.warn(`${lang} voice not installed`);
      return;
    }

    Tts.speak(text);
  }
}

export default new MultiLanguageTTSService();
