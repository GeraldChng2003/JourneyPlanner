import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

const Help = () => {

    /*
  Purpose of function: Show help / FAQs
  */
  const faqs = [
    {
      question: 'What is this app about?',
      answer: [
        'A mobile app that allows you to track and plan your journey via public transportation',
      ],
    },
    {
      question: 'How does it work?',
      answer: [
        'It works by entering your travel information such as depature and destination location.',
        'After that, you can plan the time of the trip as well as any other preferences.',
        'The system will then give you a recommended route based on that.',
      ],
    },
    {
      question: 'Can I see the route in detail',
      answer: [
        'Every step of the route will be shown within the app.',
        'You will also be allowed to open the directions in any other apps such as Google Maps.',
            ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <Text style={styles.question}>{faq.question}</Text>
          <View style={styles.answer}>
            {faq.answer.map((answer, answerIndex) => (
              <Text key={answerIndex} style={styles.answerItem}>
                {answerIndex + 1}. {answer}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};


/*
Purpose to set the css styles for this document 
*/

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answer: {
    marginLeft: 10,
  },
  answerItem: {
    fontSize: 14,
  },
});
export default Help;
