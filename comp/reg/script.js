(function () {
	angular.module('app', []);
	angular.module('app').controller("WizardController", [wizardController]);

	// https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-javascript-objects
  	Object.flatten = function(data) {
    	var result = {};
    	function recurse (cur, prop) {
        	if (Object(cur) !== cur) {
            	result[prop] = cur;
        	} else if (Array.isArray(cur)) {
            	for(var i=0, l=cur.length; i<l; i++)
                	recurse(cur[i], prop + "[" + i + "]");
            	if (l == 0)
                	result[prop] = [];
        	} else {
            	var isEmpty = true;
            	for (var p in cur) {
                	isEmpty = false;
                	recurse(cur[p], prop ? prop+"."+p : p);
            	}
            	if (isEmpty && prop)
                	result[prop] = {};
			}
    	}
    	recurse(data, "");
    	return result;
  	}

	function wizardController() {
		var vm = this;

		vm.thisYear = new Date().getFullYear();

		var instruments = ['bagpipes', 'snare', 'tenor', 'bass'];

		// steps that appear only at the end of the wizard
		var oneTimeSteps = [{ name: 'acknowledge' }, { name: 'payment' }];

		// steps that appear for each registrant
		var repeatingSteps = [{
			name: 'step1'
		}, {
			name: 'competition',
			context: 'competition'
		}, {
			name: 'bagpipes',
			context: 'competition'
		}, {
			name: 'snare',
			context: 'competition'
		}, {
			name: 'tenor',
			context: 'competition'
		}, {
			name: 'bass',
			context: 'competition'
		}, {
			name: 'workshop'
		}, {
			name: 'confirm'
		}];

		// init ********************
		init();
		
		vm.gotoStep = function (direction) {
			// When user hits the "next" button, disable steps depending on the selections made on the current step, where appropriate
			if (vm.steps[vm.currentStepIndex].name === 'step1') {
				step1Adjustments();
			}
			else if (vm.steps[vm.currentStepIndex].name === 'competition') {
				competitionStepAdjustments();
			}
			else if (vm.steps[vm.currentStepIndex].name === 'confirm') {
				confirmStepAdjustments();
			}
			
			// Skip steps (forward or backward) until we get to one that should be shown
			var newStepIndex = vm.currentStepIndex + direction;
			while (!vm.steps[newStepIndex].stepEnabled) {
				newStepIndex += direction;
			}
			
			vm.currentStepIndex = newStepIndex;
			vm.currentFormName = vm.steps[newStepIndex].formName;
			vm.currentStepName = vm.steps[newStepIndex].name;
			
			if (vm.currentStepName === 'confirm') {
				// Copy the details of the current user onto an array for the confirmation step
			  vm.users[vm.registrantIndex] = angular.copy(vm.user);
			}
		}

		vm.stepLoaded = function() {
			document.location = '#';
			if (vm.currentStepName === 'payment') {
				setTimeout(vm.renderPayPalButtons, 250);
			}
		};

		// We're preparing to send all reg data to paypal, but they don't accept a large object graph.
		// In order to meet their "order" spec, this function serializes all order entries into the 
		// "items" array as $0 items comprising the order.
		function getSerializedPaypalData() {
			var fullReg = {
				registration: {
					users: vm.users,
					totalCost: vm.total,
					paid: vm.paid,
					acknowledge: vm.acknowledge
				}
			};

			// Recursively flatten the reg details
			var flattened = JSON.stringify(Object.flatten(fullReg));
			// Remove "registration." from all paths for brevity
			var shortened = flattened.replace(/registration\./g, ""); //strip out unnecessary verbiage users.[0]
			var final = JSON.parse(shortened);

			// Now that all form entries are flattened into an object, serialize them as $0 items
			// where the item name is the object property reference from the form field, and 
			// the description is the user's selection for that field.
			var items = [];
			for (let p in final) {
				if (JSON.stringify(final[p]) === '{}') {
					// skip empty objects which prevent paypal form submission
					continue;
				}
				items.push({
					"name": p + ":" + final[p], //concatenate field name (what's left after stripping) with value
					"description": p + ":" + final[p], //p + add colon final[p] p + ":" + final[p]: 
					"unit_amount": {
					   "currency_code": "USD",
					   "value": "0"
					 },
					 "quantity": "1"
				});
			}

			// add a summary item so that the item total matches the total of the order
			items.unshift({
				"name": "Summary",
				"description": "Total Paid", /* Item details will also be in the completed paypal.com transaction view */
				 "unit_amount": {
				   "currency_code": "USD",
				   "value": vm.total.toString()
				 },
				 "quantity": "1"
			});

			return {
				"purchase_units": [{
					"amount": {
					"currency_code": "USD",
					"value": vm.total.toString(),
					"breakdown": {
						"item_total": {  /* Required when including the items array */
							"currency_code": "USD",
							"value": vm.total.toString()
						}
					}
				},
				"items": items
			}]};
		}

		vm.renderPayPalButtons = function() {
			paypal.Buttons({
				createOrder: function(data, actions) {
					// Set up the transaction
					return actions.order.create(getSerializedPaypalData());
				},
				onApprove: function(data, actions) {
					// Capture the funds from the transaction
					return actions.order.capture().then(function(details) {
						// Show a success message to your buyer
						vm.paid = true;
						vm.refresh();
					}).catch(showPaymentError);
				},
				onError: showPaymentError
			}).render('#paypal-button-container');
		};

		function showPaymentError(err) {
			// Show an error page here, when an error occurs
			vm.paymentError = true;
			vm.paymentErrorMessage = err.message;
			vm.refresh();
		}

		vm.showNavButtons = function() {
			return vm.currentStepName !== 'payment';
		};

		vm.refresh = function() {
			angular.element($("#wizard-content-container")).scope().$apply();
		};
			
		function scrollToTop(delay) {
			setTimeout(function() {
				document.location = '#';
			}, delay || 1);
		}
	  
		function step1Adjustments() {
			vm.steps.filter(function(s) { return s.registrantIndex === vm.registrantIndex && s.context === 'competition'; }).forEach(function(s) { s.stepEnabled = vm.user.competition; });
			vm.steps.filter(function(s) { return s.registrantIndex === vm.registrantIndex && s.name === 'workshop'; })[0].stepEnabled = vm.user.workshop;
		}
	  
		function competitionStepAdjustments() {
			// enable instrument steps based on the value of vm.user.comp[instruments[i]].checked
			for (var i = 0; i < instruments.length; i++) {
				vm.steps.filter(function(s) { return s.registrantIndex === vm.registrantIndex && s.name === instruments[i]; })[0].stepEnabled = vm.user.comp[instruments[i]].checked;
			}
	  	}
	  
	  	function confirmStepAdjustments() {
		getSerializedPaypalData(); 

			if ((vm.user.confirmAnother || 'No') === 'No') {
				return;
			}
			else if (vm.user.confirmAnother === 'Yes') {
				// User wants to register another person.  We need to add more steps.
				vm.registrantIndex++;
				addRegistrantSteps();
				vm.user = getNewUser();
			}
		}
      
		vm.getStepTemplate = function(){
			return vm.steps[vm.currentStepIndex].template;
		};

		vm.disableNextButton = function() {
			return vm[vm.currentFormName] && vm[vm.currentFormName].$invalid;
		};
	  
	  	vm.displayYesNo = function(prop) {
			return vm.user[prop] ? 'Yes' : 'No';
		};
	  
	  	vm.getEvents = function(u, instrument) {
			if (!u.comp[instrument].checked) {
				return '';
			}

			var result = [];
			for (var e in u.comp[instrument].events) {
				result.push(u.comp[instrument].events[e]);
			}

			return result.join(', ');
		};
	  
	  	function translate(e) {
			var parts = e.split('_');
			return parts[0] + ' ' + eventName;
		}
		
		vm.startOver = function() {
			if (confirm('Are you sure you want to start completely over?')) {
				init();
				scrollToTop();
			}
		};

		vm.showAllNames = function() {
			return vm.users.map(function(u) { return u.name; }).join(', ');
		};

		vm.perEventCost = 10;
		vm.allEventsCost = 30;
		vm.workshopCost = 30;
		vm.eventDiscount = 10;
		vm.typicalMax = vm.allEventsCost + vm.workshopCost - vm.eventDiscount;
	  
	  	vm.getEventCost = function(u) {
			var cost = 0;
			for (var i = 0; i < instruments.length; i++) {
				if (u.comp[instruments[i]].checked) {
					var instEventCount = vm.getEvents(u, instruments[i]).split(', ').length;
					cost += ((instEventCount * vm.perEventCost) < vm.allEventsCost) ? (instEventCount * vm.perEventCost) : vm.allEventsCost;
				}
			}

			u.competitionCost = cost;
			return cost;
	  	};
	  
	  	vm.displayWorkshopCost = function(u) {
			u.workshopCost = ((u.competitionCost || 0) >= vm.allEventsCost) ? (vm.workshopCost - vm.eventDiscount) : vm.workshopCost;
			return u.workshopCost;
	  	};
	  
	  	vm.displayTotalCost = function() {
			var total = 0;
			for (var i = 0; i < vm.users.length; i++) {
				total += (vm.users[i].competitionCost || 0) + ((vm.users[i].workshop && vm.users[i].workshopCost) || 0);
			}
			vm.total = total;
			return total;
	  	};
	  
	  	function init() {
			vm.rating = 0;
			vm.hoverRating = 0;
			vm.feedback = '';
	
			vm.currentStepIndex = 0;
		  	vm.registrantIndex = 0;
      		vm.currentFormName = 'step1Form';
		  	vm.currentStepName = 'step1';

			vm.steps = [];
			addRegistrantSteps();
			addFinalSteps();

			vm.user = getNewUser(); // model representing the current registrant
			vm.users = []; // stores all registrants in order to support handling multiple registrants
		}
		
		function getNewUser() {
			var u = {
				comp: {},
				workshopPref: {}
			};

			// tack on the instruments to the comp child object in order for selections to be made on the instrument steps
			instruments.forEach(function(i) { u.comp[i] = {}; });
			return u;
		}
	  
	  	// these final steps shouldn't be repeated
	  	function addFinalSteps() {
	    	for (var x = 0; x < oneTimeSteps.length; x++) {
		  		addStep(oneTimeSteps[x], vm.steps.length);
	    	}
	  	}
	  
	  	function addRegistrantSteps() {
			var indexOffset = (vm.registrantIndex === 0) ? 0 : vm.steps.length - oneTimeSteps.length;
		    for (var s = 0; s < repeatingSteps.length; s++) {
			  addStep(repeatingSteps[s], s + indexOffset);
		    }
	  	}
	  	
	  	function addStep(stepConfig, index) {
			var stepName = stepConfig.name;
			vm.steps.splice(index, 0, {
				registrantIndex: vm.registrantIndex,
				stepIndex: index,
				name: stepName,
				template: stepName + '.html?v1.0.2.0',
				formName: stepName + 'Form',
				context: stepConfig.context,
				stepEnabled: true // controls whether the step will be shown.  can be set to false as the user provides input through the steps
			});
		}
	}
})();