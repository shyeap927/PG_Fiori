sap.ui.define([
	"sap/ui/test/Opa5",
	"test/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Common, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals) {
	"use strict";

	var sViewName = "Master",
		sSomethingThatCannotBeFound = "*#-Q@@||",
		iGroupingBoundary = 100;

	function enterSomethingInASearchField(oSearchField, oSearchParams) {
		oSearchParams = oSearchParams || {};

		if (oSearchParams.searchValue) {
			oSearchField.setValue(oSearchParams.searchValue);
		}

		if (oSearchParams.skipEvent) {
			return;
		}

		var oEvent = jQuery.Event("touchend");
		oEvent.originalEvent = {
			query: oSearchParams.searchValue,
			refreshButtonPressed: oSearchParams.refreshButtonPressed,
			id: oSearchField.getId()
		};
		oEvent.target = oSearchField;
		oEvent.srcElement = oSearchField;
		jQuery.extend(oEvent, oEvent.originalEvent);

		oSearchField.fireSearch(oEvent);
	}

	Opa5.createPageObjects({
		onTheMasterPage: {
			baseClass: Common,

			actions: {

				iWaitUntilTheListIsLoaded: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: new AggregationLengthEquals({
							name: "items",
							length: 10
						}),
						errorMessage: "The master list has not been loaded"
					});
				},

				iWaitUntilTheFirstItemIsSelected: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							// wait until the list has a selected item
							var oSelectedItem = oList.getSelectedItem();
							return oSelectedItem && oList.getItems().indexOf(oSelectedItem) === 0;
						},
						errorMessage: "The first item of the master list is not selected"
					});
				},

				iSortTheListOnName: function() {
					return this.iPressItemInSelectInFooter("sort-select", "masterSort1");
				},

				iSortTheListOnUnitNumber: function() {
					return this.iPressItemInSelectInFooter("sort-select", "masterSort2");
				},

				iRemoveFilterFromTheList: function() {
					return this.iPressItemInSelectInFooter("filter-select", "masterFilterNone");
				},

				iFilterTheListLessThan100UoM: function() {
					return this.iPressItemInSelectInFooter("filter-select", "masterFilter1");
				},

				iFilterTheListMoreThan100UoM: function() {
					return this.iPressItemInSelectInFooter("filter-select", "masterFilter2");
				},

				iGroupTheList: function() {
					return this.iPressItemInSelectInFooter("group-select", "masterGroup1");
				},

				iRemoveListGrouping: function() {
					return this.iPressItemInSelectInFooter("group-select", "masterGroupNone");
				},

				iOpenViewSettingsDialog: function() {
					return this.waitFor({
						id: "filter-button",
						viewName: sViewName,
						check: function() {
							var oViewSettingsDialog = Opa5.getWindow().sap.ui.getCore().byId("viewSettingsDialog");
							// check if the dialog is still open - wait until it is closed
							// view settings dialog has no is open function and no open close events so checking the domref is the only option here
							// if there is no view settings dialog yet, there is no need to wait
							return !oViewSettingsDialog || oViewSettingsDialog.$().length === 0;
						},
						success: function(oButton) {
							oButton.$().trigger("tap");
						},
						errorMessage: "Did not find the 'filter' button."
					});
				},

				iSelectListItemInViewSettingsDialog: function(sListItemTitle) {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.StandardListItem",
						matchers: new Opa5.matchers.PropertyStrictEquals({
							name: "title",
							value: sListItemTitle
						}),
						success: function(aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "Did not find list item with title " + sListItemTitle + " in View Settings Dialog."
					});
				},

				iPressOKInViewSelectionDialog: function() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new Opa5.matchers.PropertyStrictEquals({
							name: "text",
							value: "OK"
						}),
						success: function(aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the ViewSettingDialog's 'OK' button."
					});
				},

				iPressResetInViewSelectionDialog: function() {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new Opa5.matchers.PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://refresh"
						}),
						success: function(aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the ViewSettingDialog's 'Reset' button."
					});
				},

				iPressItemInSelectInFooter: function(sSelect, sItem) {
					return this.waitFor({
						id: sSelect,
						viewName: sViewName,
						success: function(oSelect) {
							oSelect.open();
							this.waitFor({
								id: sItem,
								viewName: sViewName,
								success: function(oElem) {
									oElem.$().trigger("tap");
								},
								errorMessage: "Did not find the " + sItem + " element in select"
							});
						}.bind(this),
						errorMessage: "Did not find the " + sSelect + " select"
					});
				},

				iRememberTheSelectedItem: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							return oList.getSelectedItem();
						},
						success: function(oListItem) {
							this.getContext().currentListItem = oListItem;
						},
						errorMessage: "The list does not have a selected item so nothing can be remembered"
					});
				},

				iRememberTheIdOfListItemAtPosition: function(iPosition) {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							return oList.getItems()[iPosition];
						},
						success: function(oListItem) {
							this.getContext().currentListItem = oListItem;
						},
						errorMessage: "The list does not have an item at the index " + iPosition
					});
				},

				iRememberAnIdOfAnObjectThatsNotInTheList: function() {
					return this.waitFor(this.createAWaitForAnEntitySet({
						entitySet: "SoHeaderDataSet",
						success: function(aEntityData) {
							this.waitFor({
								id: "list",
								viewName: sViewName,
								matchers: new AggregationFilled({
									name: "items"
								}),
								success: function(oList) {
									var aItemsNotInTheList = aEntityData.filter(function(oObject) {
										return !oList.getItems().some(function(oListItem) {
											return oListItem.getBindingContext().getProperty("Vbeln") === oObject.Vbeln;
										});
									});

									if (!aItemsNotInTheList.length) {
										QUnit.ok(false, "Did not find a list item that is not in the list");
									}

									this.getContext().currentId = aItemsNotInTheList[0].Vbeln;
								},
								errorMessage: "the model does not have a item that is not in the list"
							});
						}
					}));
				},

				iPressOnTheObjectAtPosition: function(iPositon) {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							return oList.getItems()[iPositon];
						},
						success: function(oListItem) {
							oListItem.$().trigger("tap");
						},
						errorMessage: "List 'list' in view '" + sViewName + "' does not contain an ObjectListItem at position '" + iPositon + "'"
					});
				},

				iSearchForTheFirstObject: function() {
					var sFirstObjectTitle;

					this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oList) {
							sFirstObjectTitle = oList.getItems()[0].getTitle();
						},
						errorMessage: "Did not find list items while trying to search for the first item."
					});

					return this.waitFor({
						id: "searchField",
						viewName: sViewName,
						success: function(oSearchField) {
							enterSomethingInASearchField(oSearchField, {
								searchValue: sFirstObjectTitle
							});
						},
						errorMessage: "Failed to find search field in Master view.'"
					});
				},

				iTypeSomethingInTheSearchThatCannotBeFound: function() {
					return this.iSearchForValue({
						searchValue: sSomethingThatCannotBeFound,
						skipEvent: true
					});
				},

				iSearchForValue: function(oSearchParams) {
					return this.waitFor({
						id: "searchField",
						viewName: sViewName,
						success: function(oSearchField) {
							enterSomethingInASearchField(oSearchField, oSearchParams);
						},
						errorMessage: "Failed to find search field in Master view.'"
					});
				},

				iClearTheSearch: function() {
					return this.iSearchForValue({
						searchValue: ""
					});
				},

				iSearchForSomethingWithNoResults: function() {
					return this.iSearchForValue({
						searchValue: sSomethingThatCannotBeFound
					});
				},

				iTriggerRefresh: function() {
					return this.iSearchForValue({
						refreshButtonPressed: true
					});
				}

			},

			assertions: {

				iShouldSeeTheBusyIndicator: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						success: function(oList) {
							// we set the list busy, so we need to query the parent of the app
							QUnit.ok(oList.getBusy(), "The master list is busy");
						},
						errorMessage: "The master list is not busy."
					});
				},

				theListGroupShouldBeFilteredOnUnitNumberValue20OrLess: function() {
					return this.theListShouldBeFilteredOnUnitNumberValue(20, false, {
						iLow: 1,
						iHigh: 2
					});
				},

				theListShouldContainAGroupHeader: function() {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						viewName: sViewName,
						success: function() {
							QUnit.ok(true, "Master list is grouped");
						},
						errorMessage: "Master list is not grouped"
					});
				},

				theListHeaderDisplaysZeroHits: function() {
					return this.waitFor({
						viewName: sViewName,
						id: "page",
						matchers: new PropertyStrictEquals({
							name: "title",
							value: "SoHeaderDataSet (0)"
						}),
						success: function() {
							QUnit.ok(true, "The list header displays 'SoHeaderDataSet (0)'");
						},
						errorMessage: "The list still has items"
					});
				},

				theListHasEntries: function() {
					return this.waitFor({
						viewName: sViewName,
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function() {
							QUnit.ok(true, "The list has items");
						},
						errorMessage: "The list had no items"
					});
				},

				theListShouldNotContainGroupHeaders: function() {
					function fnIsGroupHeader(oElement) {
						return oElement.getMetadata().getName() === "sap.m.GroupHeaderListItem";
					}

					return this.waitFor({
						viewName: sViewName,
						id: "list",
						matchers: function(oList) {
							return !oList.getItems().some(fnIsGroupHeader);
						},
						success: function() {
							QUnit.ok(true, "Master list does not contain a group header although grouping has been removed.");
						},
						errorMessage: "Master list still contains a group header although grouping has been removed."
					});
				},

				theListShouldBeSortedAscendingOnUnitNumber: function() {
					return this.theListShouldBeSortedAscendingOnField("");
				},

				theListShouldBeSortedAscendingOnName: function() {
					return this.theListShouldBeSortedAscendingOnField("Abdis");
				},

				theListShouldBeSortedAscendingOnField: function(sField) {
					function fnCheckSort(oList) {
						var oLastValue = null,
							fnIsOrdered = function(oElement) {
								if (!oElement.getBindingContext()) {
									return false;
								}

								var oCurrentValue = oElement.getBindingContext().getProperty(sField);

								if (oCurrentValue === undefined) {
									return false;
								}

								if (!oLastValue || oCurrentValue >= oLastValue) {
									oLastValue = oCurrentValue;
								} else {
									return false;
								}
								return true;
							};

						return oList.getItems().every(fnIsOrdered);
					}

					return this.waitFor({
						viewName: sViewName,
						id: "list",
						matchers: fnCheckSort,
						success: function() {
							QUnit.ok(true, "Master list has been sorted correctly for field '" + sField + "'.");
						},
						errorMessage: "Master list has not been sorted correctly for field '" + sField + "'."
					});
				},

				theListShouldBeFilteredOnUnitNumberValue: function(iThreshhold, bGreaterThan, oRange) {

					function fnCheckFilter(oList) {
						var fnIsGreaterThanMaxValue = function(oElement) {
							if (bGreaterThan) {
								return oElement.getBindingContext().getProperty("UnitNumber") < iThreshhold;
							}
							return oElement.getBindingContext().getProperty("UnitNumber") > iThreshhold;
						};
						var aItems = oList.getItems();
						if (oRange) {
							aItems = aItems.slice(oRange.iLow, oRange.iHigh);
						}

						return !aItems.some(fnIsGreaterThanMaxValue);
					}

					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: fnCheckFilter,
						success: function() {
							QUnit.ok(true, "Master list has been filtered correctly with filter value '" + iThreshhold + "'.");
						},
						errorMessage: "Master list has not been filtered correctly with filter value '" + iThreshhold + "'."
					});
				},

				theMasterListShouldBeFilteredOnUnitNumberValueMoreThanTheGroupBoundary: function() {
					return this.theListShouldBeFilteredOnUnitNumberValue(iGroupingBoundary, true);
				},

				theMasterListShouldBeFilteredOnUnitNumberValueLessThanTheGroupBoundary: function() {
					return this.theListShouldBeFilteredOnUnitNumberValue(iGroupingBoundary);
				},

				iShouldSeeTheList: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						success: function(oList) {
							QUnit.ok(oList, "Found the object List");
						},
						errorMessage: "Can't see the master list."
					});
				},

				theListShowsOnlyObjectsWithTheSearchStringInTheirTitle: function() {
					this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oList) {
							var sTitle = oList.getItems()[0].getTitle(),
								bEveryItemContainsTheTitle = oList.getItems().every(function(oItem) {
									return oItem.getTitle().indexOf(sTitle) !== -1;
								});

							QUnit.ok(bEveryItemContainsTheTitle, "Every item did contain the title");
						},
						errorMessage: "The list did not have items"
					});
				},

				theListShouldHaveNEntries: function(iObjIndex) {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: [new AggregationLengthEquals({
							name: "items",
							length: iObjIndex
						})],
						success: function(oList) {
							QUnit.strictEqual(oList.getItems().length, iObjIndex, "The list has x items");
						},
						errorMessage: "List does not have " + iObjIndex + " entries."
					});
				},

				theListShouldHaveAllEntries: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							var iThreshold = oList.getGrowingThreshold();
							return new AggregationLengthEquals({
								name: "items",
								length: iThreshold
							}).isMatching(oList);
						},
						success: function(oList) {
							QUnit.strictEqual(oList.getItems().length, oList.getGrowingThreshold(), "The growing list has 10 items");
						},
						errorMessage: "List does not have all entries."
					});
				},

				iShouldSeeTheNoDataTextForNoSearchResults: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						success: function(oList) {
							QUnit.strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataWithFilterOrSearchText"),
								"the list should show the no data text for search and filter");
						},
						errorMessage: "list does not show the no data text for search and filter"
					});
				},

				theHeaderShouldDisplayAllEntries: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						success: function(oList) {
							var iExpectedLength = oList.getBinding("items").getLength();
							this.waitFor({
								id: "page",
								viewName: sViewName,
								matchers: new PropertyStrictEquals({
									name: "title",
									value: "SoHeaderDataSet (" + iExpectedLength + ")"
								}),
								success: function() {
									QUnit.ok(true, "The master page header displays " + iExpectedLength + " items");
								},
								errorMessage: "The  master page header does not display " + iExpectedLength + " items."
							});
						},
						errorMessage: "Header does not display the number of items in the list"
					});
				},

				theFirstItemShouldBeSelected: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oList) {
							QUnit.strictEqual(oList.getItems()[0], oList.getSelectedItem(), "The first object is selected");
						},
						errorMessage: "The first object is not selected."
					});
				},

				theListShouldHaveNoSelection: function() {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							return !oList.getSelectedItem();
						},
						success: function(oList) {
							QUnit.strictEqual(oList.getSelectedItems().length, 0, "The list selection is removed");
						},
						errorMessage: "List selection was not removed"
					});
				},

				theRememberedListItemShouldBeSelected: function() {
					this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: function(oList) {
							return oList.getSelectedItem();
						},
						success: function(oSelectedItem) {
							QUnit.strictEqual(oSelectedItem.getTitle(), this.getContext().currentListItem.getTitle(), "The list selection is incorrect");
						},
						errorMessage: "The list has no selection"
					});
				}

			}

		}

	});

});