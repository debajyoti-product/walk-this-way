import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Linking } from 'react-native';
import { Text } from './AppText';

export default function FeedbackModal({ onClose }) {
  const [excitement, setExcitement] = useState(null); // 'yes' or 'no'
  const [thoughts, setThoughts] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!excitement) return;
    setSending(true);

    try {
      const formData = new FormData();
      formData.append('email', 'feedback@walkthisway.app');
      formData.append('_subject', 'Walk This Way — Feedback');
      formData.append('Does this excite you?', excitement === 'yes' ? 'Yes!' : 'Not really');
      formData.append('Thoughts', thoughts || '(no thoughts shared)');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');

      await fetch('https://formsubmit.co/ajax/iamdebajyoti850@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      setSent(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      // Fallback: open mailto
      const subject = encodeURIComponent('Walk This Way — Feedback');
      const body = encodeURIComponent(
        `Does this excite you? ${excitement === 'yes' ? 'Yes!' : 'Not really'}\n\nThoughts: ${thoughts || '(none)'}`
      );
      Linking.openURL(`mailto:iamdebajyoti850@gmail.com?subject=${subject}&body=${body}`);
      setSent(true);
      setTimeout(() => onClose(), 1200);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modal}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {sent ? (
          <View style={styles.success}>
            <Text style={styles.successIcon}>💚</Text>
            <Text style={styles.successText}>Thanks for sharing!</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.question}>Does this excite you?</Text>

            <View style={styles.options}>
              <Pressable
                style={[styles.option, excitement === 'yes' && styles.optionSelected]}
                onPress={() => setExcitement('yes')}
              >
                <Text style={[styles.optionText, excitement === 'yes' && styles.optionTextSelected]}>Yes!</Text>
              </Pressable>
              <Pressable
                style={[styles.option, excitement === 'no' && styles.optionSelectedRed]}
                onPress={() => setExcitement('no')}
              >
                <Text style={[styles.optionTextRed, excitement === 'no' && styles.optionTextSelectedRed]}>Not really</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Do share your thoughts if you want"
              placeholderTextColor="#888"
              value={thoughts}
              onChangeText={setThoughts}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.sendBtn, (!excitement || sending) && styles.sendBtnDisabled]}
              onPress={handleSubmit}
              disabled={!excitement || sending}
            >
              <Text style={[styles.sendBtnText, (!excitement || sending) && styles.sendBtnTextDisabled]}>
                {sending ? 'Sending…' : 'Send Feedback'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    color: '#888',
    fontSize: 20,
  },
  success: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successText: {
    color: '#fff',
    fontSize: 20,
    },
  formContainer: {
    marginTop: 10,
  },
  question: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#111',
  },
  optionSelected: {
    borderColor: '#00fa9a',
    backgroundColor: 'rgba(0, 250, 154, 0.1)',
  },
  optionSelectedRed: {
    borderColor: '#ff6b9d',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  optionText: {
    color: '#aaa',
    fontSize: 16,
    },
  optionTextRed: {
    color: '#aaa',
    fontSize: 16,
    },
  optionTextSelected: {
    color: '#00fa9a',
  },
  optionTextSelectedRed: {
    color: '#ff6b9d',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
  },
  sendBtn: {
    backgroundColor: '#00fa9a',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#333',
  },
  sendBtnText: {
    color: '#000',
    fontSize: 16,
    },
  sendBtnTextDisabled: {
    color: '#666',
  },
});
