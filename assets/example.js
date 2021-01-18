$(document).ready(function() {
   const builderRef = mcqExamBuilder({
      questionRenderTarget: $(".question"),
      answersRenderTarget: $(".answers"),
      
      handleLoadQuestions: () => loadQuestionsRequest(),
      handleSubmitAnswer: (answerData) => submitAnswerRequest(answerData),

      onQuestionChanged: (question) => {
         const questions = builderRef.getQuestionData();
         const index = questions.findIndex(p=> p.id === question.id);

         $("#question-number").text(index + 1);
      },
      onAnswerSubmiting: () => {
         $(".question-viewer").addClass("submiting");
      },
      onAnswerSubmited: () => {
         $(".question-viewer").removeClass("submiting");
      }
   })

   builderRef.initialize();

   $("#answer-button").click(function() {
      builderRef.submitAnswer().then(() => {
         builderRef.nextQuestion();
      })
   });
});


const mockData = [
   {
      id:1,
      content: "<img src=\"https://cdn-tpr.pressidium.com/wp-content/uploads/2018/10/clip_image001.gif\" /><p><strong>Which vacation destination is most common for the students?</strong></p>",
      solution: "25% is larger than any of the percentages given for the other destinations, thus the beach is the most common destination.",
      answers: [
         {content: "Beach", correct: true,id: 10001},
         {content: "Historical Sites", correct: false, id: 10002},
         {content: "Cruises", correct: false, id: 10003},
         {content: "Mountains", correct: false, id: 10004},
         {content: "Other", correct: false, id: 10005},
      ]
   },
   {
      id:2,
      content: "<p>What is the fraction equivalent of the shaded region in the following circle?</p><img src=\"https://cdn-tpr.pressidium.com/wp-content/uploads/2018/10/clip_image0011.gif\" />",
      solution: "The circle is divided into 3 equal sections, whereby 2 of them of are shaded. Thus, the represented fraction is 2/3.",
      answers: [
         {content: "<sup>2</sup>/<sub>3</sub>", correct: true,id: 10006},
         {content: "<sup>3</sup>/<sub>8</sub>", correct: false, id: 10007},
         {content: "<sup>4</sup>/<sub>5</sub>", correct: false, id: 10008},
         {content: "<sup>3</sup>/<sub>4</sub>", correct: false, id: 10009},
         {content: "<sup>7</sup>/<sub>16</sub>", correct: false, id: 10010},
      ]
   }
]

const loadQuestionsRequest = () => {
   return new Promise(resolve => {
      setTimeout(() => {
         const result = mockData.map(q => (
            {
               id: q.id,
               content: q.content,
               answers: q.answers.map(a => ({id:a.id, content: a.content}))
            }
         ));

         console.group("Load Request");
         console.log(result);
         console.groupEnd();
         resolve(result);
      }, 1500)
   })
}

const submitAnswerRequest = (answerData) => {
   console.group("Submit Request");
   console.log(answerData);
   return new Promise(resolve => {
      setTimeout(() => {
         console.log("submit end")
         console.groupEnd();
         resolve();
      }, 1000);
   })
}