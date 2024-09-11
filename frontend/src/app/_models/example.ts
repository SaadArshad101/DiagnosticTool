export const HEALTHSURVEY = {
  id: '1',
  title: 'Test Health Survey',
  description: 'A survey for your health',
  questions: [
    {
      questionText: 'Do you eat breakfast?',
      answerOptions: [
        {
          answerText: 'No, I skip it',
          value: '0'
        },
        {
          answerText: 'Yes, I eat breakfast',
          value: '10'
        }
      ],
      answerType: 'Y/N'
    },
    {
      questionText: 'How many greens do you eat a day?',
      answerOptions: [
        {
          answerText: 'None',
           value :  '0'
        },
        {
           answerText :  'A little' ,
           value :  '3'
        },
        {
           answerText :  'A lot' ,
           value :  '10'
        }
      ],
       answerType : 'Multiple Choice'
    },
    {
       questionText : 'Are you aware of your caloric intake?',
       answerOptions : [
        {
           answerText : 'No, I do not keep track of it',
           value : '0'
        },
        {
           answerText : 'Yes, I keep track of it',
           value : '5'
        }
      ],
       answerType : 'Y/N'
    },
    {
       questionText : 'How many home cooked meals do you eat per week?',
       answerOptions : [
        {
           answerText : 'None',
           value : '0'
        },
        {
           answerText : '1-3',
           value : '3'
        },
        {
           answerText : '4-8',
           value : '8'
        },
        {
           answerText : 'More than 8',
           value : '15'
        }
      ],
       answerType : 'Multiple Choice'
    }
  ],
   rubric : [
    {
       min : '0',
       max : '10',
       title : 'Unhealthy',
       responseText : 'You are unhealthy!'
       /*
       object: {
         title:
         stategicConsiderations: string,
         image: string(url),
         summary: (questions, answers, notes),
         swot: 
       }
       */
    },
    {
       min : '11',
       max : '20',
       title : 'Moderately Healthy',
       responseText : 'You are moderately healthy'
    },
    {
       min : '21',
       max : '40',
       title : 'Very Healthy',
       responseText : 'You are very healthy!'
    }
  ]
};
