function mcqExamBuilder(uOptions) {
	const defaultOptions = {
		optionTemplates: ["A", "B", "C", "D", "E"],
		questionRenderTarget: null,
		answersRenderTarget: null,
		summaryRenderTarget: null,
		answerCleanable: true,
		questionRenderer: (question) => question.content,
		answerRenderer: ({ optionTemplates, index, answer, isSelected }) => {
			return `
            <div class="answer ${isSelected ? "answer-selected" : ""}">
               <div class="answer-selector"></div>
					<div class="answer-cont">
						<span style="margin-right:5px">${optionTemplates[index]})</span> ${answer.content}</div>
            </div>
         `;
		},
		summaryLineRenderer: (summaryItemData, question) => {
			return `
            <div data-show-question="${question.id}" class="summary-item ${
				summaryItemData.isActive ? "summary-item-active" : ""
			} ${summaryItemData.isAnswered ? "summary-item-answered" : ""}">
               <div class="summary-title">${
						summaryItemData.index + 1
					}. Soru</div>
               <div class="summary-keys">
                  ${question.answers
							.map(
								(answer, aIndex) =>
									`<div class="summary-key ${
										answer.id === question.selectedAnswerId
											? "summary-key-selected"
											: ""
									}">${options.optionTemplates[aIndex]}</div>`
							)
							.join("")}
               </div>
            </div>
         `;
		},

		onAnswerChanged: (answerData, activeQuestion, e) => {},
		onAnswerSubmiting: (answerData, activeQuestion) => {},
		onAnswerSubmited: (answerData, activeQuestion) => {},
		onQuestionChanged: (question) => {},
		handleSubmitAnswer: (answerData, activeQuestion) => {},
		handleLoadQuestions: () => {},
		onReady: () => {},
		questionChangeOnSummaryClick: true,
	};

	let options = { ...defaultOptions, ...uOptions };

	let questionData = null;
	let activeQuestionIndex = null;
	let activeQuestion = null;
	let selectedAnswerId = null;

	let _isSubmiting = false;

	const loadQuestionData = () => {
		return options
			.handleLoadQuestions()
			.then((questionList) => (questionData = questionList));
	};
	const renderQuestion = (question) => {
		options.questionRenderTarget.html(options.questionRenderer(question));
	};
	const renderAnswers = (question) => {
		options.answersRenderTarget.html("");
		question.answers.forEach((answer, index) => {
			let $answer = $(
				options.answerRenderer({
					answer,
					index,
					optionTemplates: options.optionTemplates,
					isSelected: answer.id === question.selectedAnswerId,
				})
			);
			$answer.click((e) => {
				if (options.answerCleanable && selectedAnswerId === answer.id) {
					$answer.removeClass("answer-selected");
				} else {
					$answer
						.addClass("answer-selected")
						.siblings()
						.removeClass("answer-selected");
				}

				answerQuestion(question.id, answer.id, e);
			});

			options.answersRenderTarget.append($answer);
		});
	};
	const renderSummary = () => {
		if(options.summaryRenderTarget === null)
			return;


		let html = "";
		questionData.forEach((question, index) => {
			let data = {
				index: index,
				isActive: index === activeQuestionIndex,
				isAnswered: question.selectedAnswerId !== null,
			};
			html += options.summaryLineRenderer(data, question);
		});

		options.summaryRenderTarget.html(html);

		if (options.questionChangeOnSummaryClick === true)
			options.summaryRenderTarget
				.find("[data-show-question]")
				.click(function () {
					let questionId = $(this).data("showQuestion");
					showQuestionById(questionId);
				});
	};

	const answerQuestion = (questionId, answerId, e) => {
		// const question = questionData.find(p=>p.id === questionId);
		if (selectedAnswerId === answerId && options.answerCleanable) selectedAnswerId = null;
		else selectedAnswerId = answerId;

		options.onAnswerChanged(
			{ questionId, answerId: selectedAnswerId },
			activeQuestion,
			e
		);
	};

	const submitAnswer = (answerData = null) => {
		return new Promise((resolve) => {
			if (answerData == null)
				answerData = {
					questionId: activeQuestion.id,
					answerId: selectedAnswerId,
				};

			_isSubmiting = true;
			options.onAnswerSubmiting(answerData, activeQuestion);
			//submit question
			options.handleSubmitAnswer(answerData, activeQuestion).then((r) => {
					questionData[
						activeQuestionIndex
					].selectedAnswerId = selectedAnswerId;
	
					renderSummary();
					_isSubmiting = false;
					options.onAnswerSubmited(answerData, activeQuestion);
	
					resolve(r);
			});
		});
	};

	const showQuestion = (question) => {
		activeQuestion = question;
		activeQuestionIndex = questionData.findIndex((p) => p.id === question.id);

		selectedAnswerId = activeQuestion.selectedAnswerId;
		renderQuestion(question);
		renderAnswers(question);
		renderSummary();

		options.onQuestionChanged(question);
	};
	const showQuestionById = (id) => {
		let question = testerObj.getQuestionData().find((q) => q.id === id);
		return showQuestion(question);
	};
	const showQuestionByIndex = (index) => {
		let question = testerObj.getQuestionData()[index];
		return showQuestion(question);
	};

	const initialize = () => {
		loadQuestionData().then((questionData) => {
			showQuestion(questionData[0]);
			renderSummary(questionData);

			options.onReady();
		});
	};

	let testerObj = {
		initialize: initialize,
		reloadQuestionData: loadQuestionData,
		canShowNext: () => {
			return activeQuestionIndex < questionData.length - 1;
		},
		canShowPrevious: () => {
			return activeQuestionIndex > 0;
		},

		getQuestionData: () => questionData,
		getActiveQuestionIndex: () => activeQuestionIndex,
		getActiveQuestion: () => activeQuestion,
		getQuestionById: (id) =>
			questionData ? questionData.find((q) => q.id === id) : null,
		getQuestionByIndex: (index) =>
			questionData ? questionData[index] : null,
		getSelectedAnswer: () => {
			if(selectedAnswerId === null) return null;

			return activeQuestion.answers.find(answer => answer.id === selectedAnswerId);
		},
		nextQuestion: () => {
			if (testerObj.canShowNext()) {
				showQuestionByIndex(activeQuestionIndex + 1);
				return true;
			}

			return false;
		},
		previousQuestion: () => {
			if (testerObj.canShowPrevious()) {
				showQuestionByIndex(activeQuestionIndex - 1);
				return true;
			}

			return false;
		},

		showQuestion,
		showQuestionById,
		showQuestionByIndex,
		submitAnswer,
		isSubmiting: () => _isSubmiting
	};

	return testerObj;
}
