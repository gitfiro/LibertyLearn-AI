import { Question, QuizCategory } from '../types';

export const civicsQuestions: Question[] = [
  // AMERICAN GOVERNMENT
  {
    questionText: "What is the supreme law of the land?",
    options: ["The Constitution", "The Declaration of Independence", "The Bill of Rights", "The Articles of Confederation"],
    correctAnswer: "The Constitution",
    explanation: "The Constitution is the supreme law of the land because it sets up the government and protects basic rights.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What does the Constitution do?",
    options: ["Sets up the government", "Declares independence", "Ends slavery", "Defines the 50 states"],
    correctAnswer: "Sets up the government",
    explanation: "The Constitution sets up the government, defines the government, and protects basic rights of Americans.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "The idea of self-government is in the first three words of the Constitution. What are these words?",
    options: ["We the People", "In God We Trust", "Liberty for All", "United States of America"],
    correctAnswer: "We the People",
    explanation: "The Constitution begins with 'We the People' to show that the power of government comes from the people.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is an amendment?",
    options: ["A change to the Constitution", "A new law", "A speech by the President", "A Supreme Court decision"],
    correctAnswer: "A change to the Constitution",
    explanation: "An amendment is a change or addition to the Constitution.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What do we call the first ten amendments to the Constitution?",
    options: ["The Bill of Rights", "The Preamble", "The Articles", "The Declaration"],
    correctAnswer: "The Bill of Rights",
    explanation: "The first ten amendments to the Constitution are called the Bill of Rights.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is one right or freedom from the First Amendment?",
    options: ["Speech", "Bear arms", "Vote", "Trial by jury"],
    correctAnswer: "Speech",
    explanation: "Rights in the First Amendment include speech, religion, assembly, press, and petition the government.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "How many amendments does the Constitution have?",
    options: ["27", "10", "21", "50"],
    correctAnswer: "27",
    explanation: "The Constitution has been amended 27 times.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What did the Declaration of Independence do?",
    options: ["Announced our independence from Great Britain", "Freed the slaves", "Established the judicial branch", "Created the Constitution"],
    correctAnswer: "Announced our independence from Great Britain",
    explanation: "The Declaration of Independence announced that the United States was free from Great Britain.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What are two rights in the Declaration of Independence?",
    options: ["Life and liberty", "Life and death", "Liberty and justice", "Pursuit of happiness and property"],
    correctAnswer: "Life and liberty",
    explanation: "The rights in the Declaration are Life, Liberty, and the pursuit of Happiness.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is freedom of religion?",
    options: ["You can practice any religion, or not practice a religion", "You must practice a religion", "You cannot practice a religion", "The government chooses your religion"],
    correctAnswer: "You can practice any religion, or not practice a religion",
    explanation: "Freedom of religion means you can practice any religion, or not practice a religion.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is the economic system in the United States?",
    options: ["Capitalist economy", "Communist economy", "Socialist economy", "Barter economy"],
    correctAnswer: "Capitalist economy",
    explanation: "The US has a capitalist or market economy.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is the 'rule of law'?",
    options: ["Everyone must follow the law", "The President makes the laws", "The police are above the law", "Judges interpret the law as they please"],
    correctAnswer: "Everyone must follow the law",
    explanation: "Rule of law means everyone must follow the law, leaders must obey the law, government must obey the law, and no one is above the law.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Name one branch or part of the government.",
    options: ["Congress", "The Pentagon", "The United Nations", "The IRS"],
    correctAnswer: "Congress",
    explanation: "The three branches are Legislative (Congress), Executive (President), and Judicial (The Courts).",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What stops one branch of government from becoming too powerful?",
    options: ["Checks and balances", "The President", "The Bill of Rights", "The military"],
    correctAnswer: "Checks and balances",
    explanation: "Checks and balances (or separation of powers) stop one branch from becoming too powerful.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who is in charge of the executive branch?",
    options: ["The President", "The Chief Justice", "The Speaker of the House", "The Senate Majority Leader"],
    correctAnswer: "The President",
    explanation: "The President is in charge of the executive branch.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who makes federal laws?",
    options: ["Congress", "The President", "The Supreme Court", "The Governors"],
    correctAnswer: "Congress",
    explanation: "Congress (Senate and House) makes federal laws.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What are the two parts of the U.S. Congress?",
    options: ["The Senate and House of Representatives", "The Senate and the Supreme Court", "The House and the President", "The Lords and the Commons"],
    correctAnswer: "The Senate and House of Representatives",
    explanation: "Congress is divided into the Senate and the House of Representatives.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "How many U.S. Senators are there?",
    options: ["100", "50", "435", "270"],
    correctAnswer: "100",
    explanation: "There are 100 U.S. Senators (2 for each state).",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "We elect a U.S. Senator for how many years?",
    options: ["6", "4", "2", "8"],
    correctAnswer: "6",
    explanation: "We elect a U.S. Senator for 6 years.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "The House of Representatives has how many voting members?",
    options: ["435", "100", "50", "270"],
    correctAnswer: "435",
    explanation: "The House of Representatives has 435 voting members.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "We elect a U.S. Representative for how many years?",
    options: ["2", "4", "6", "8"],
    correctAnswer: "2",
    explanation: "We elect a U.S. Representative for 2 years.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who does a U.S. Senator represent?",
    options: ["All people of the state", "Only people in their district", "The state legislature", "The Governor"],
    correctAnswer: "All people of the state",
    explanation: "A U.S. Senator represents all people of the state.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Why do some states have more Representatives than other states?",
    options: ["Because of the state's population", "Because of the state's size", "Because of the state's wealth", "Because of the state's age"],
    correctAnswer: "Because of the state's population",
    explanation: "States have more representatives because they have more people.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "We elect a President for how many years?",
    options: ["4", "8", "2", "6"],
    correctAnswer: "4",
    explanation: "We elect a President for 4 years.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "In what month do we vote for President?",
    options: ["November", "January", "October", "March"],
    correctAnswer: "November",
    explanation: "We vote for President in November.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "If the President can no longer serve, who becomes President?",
    options: ["The Vice President", "The Speaker of the House", "The Chief Justice", "The Secretary of State"],
    correctAnswer: "The Vice President",
    explanation: "If the President can no longer serve, the Vice President becomes President.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "If both the President and the Vice President can no longer serve, who becomes President?",
    options: ["The Speaker of the House", "The Chief Justice", "The Secretary of State", "The Attorney General"],
    correctAnswer: "The Speaker of the House",
    explanation: "The Speaker of the House is next in line after the Vice President.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who is the Commander in Chief of the military?",
    options: ["The President", "The Vice President", "The Secretary of Defense", "The General of the Army"],
    correctAnswer: "The President",
    explanation: "The President is the Commander in Chief of the military.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who signs bills to become laws?",
    options: ["The President", "The Vice President", "The Speaker of the House", "The Senate Majority Leader"],
    correctAnswer: "The President",
    explanation: "The President signs bills to become laws.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who vetoes bills?",
    options: ["The President", "Congress", "The Supreme Court", "The Cabinet"],
    correctAnswer: "The President",
    explanation: "The President vetoes bills.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What does the President's Cabinet do?",
    options: ["Advises the President", "Makes laws", "Commands the military", "Interprets the Constitution"],
    correctAnswer: "Advises the President",
    explanation: "The President's Cabinet advises the President.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What does the judicial branch do?",
    options: ["Reviews laws", "Makes laws", "Enforces laws", "Vetoes laws"],
    correctAnswer: "Reviews laws",
    explanation: "The judicial branch reviews laws, explains laws, resolves disputes, and decides if a law goes against the Constitution.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "What is the highest court in the United States?",
    options: ["The Supreme Court", "The Court of Appeals", "The Federal Court", "The District Court"],
    correctAnswer: "The Supreme Court",
    explanation: "The Supreme Court is the highest court in the United States.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "How many justices are on the Supreme Court?",
    options: ["9", "12", "7", "5"],
    correctAnswer: "9",
    explanation: "There are 9 justices on the Supreme Court.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Who is the Chief Justice of the United States now?",
    options: ["John Roberts", "Clarence Thomas", "Sonia Sotomayor", "Elena Kagan"],
    correctAnswer: "John Roberts",
    explanation: "John Roberts is the Chief Justice of the United States.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
    options: ["To print money", "To issue driver's licenses", "To provide schooling", "To provide police protection"],
    correctAnswer: "To print money",
    explanation: "Powers of the federal government include printing money, declaring war, creating an army, and making treaties.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  {
    questionText: "Under our Constitution, some powers belong to the states. What is one power of the states?",
    options: ["To provide schooling and education", "To print money", "To declare war", "To make treaties"],
    correctAnswer: "To provide schooling and education",
    explanation: "Powers of the states include providing schooling, police protection, fire protection, and issuing driver's licenses.",
    category: QuizCategory.AMERICAN_GOVERNMENT
  },
  
  // AMERICAN HISTORY
  {
    questionText: "Who lived in America before the Europeans arrived?",
    options: ["American Indians", "Canadians", "Mexicans", "Vikings"],
    correctAnswer: "American Indians",
    explanation: "American Indians (or Native Americans) lived in America before Europeans arrived.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What is one reason colonists came to America?",
    options: ["Freedom", "To join the British Army", "To visit", "To pay taxes"],
    correctAnswer: "Freedom",
    explanation: "Colonists came for freedom, political liberty, religious freedom, economic opportunity, etc.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who wrote the Declaration of Independence?",
    options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "Benjamin Franklin"],
    correctAnswer: "Thomas Jefferson",
    explanation: "Thomas Jefferson wrote the Declaration of Independence.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "When was the Declaration of Independence adopted?",
    options: ["July 4, 1776", "July 4, 1787", "July 4, 1812", "July 4, 1865"],
    correctAnswer: "July 4, 1776",
    explanation: "The Declaration of Independence was adopted on July 4, 1776.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "There were 13 original states. Name three.",
    options: ["New Hampshire, New York, New Jersey", "California, Texas, Florida", "New York, Florida, Texas", "Washington, Oregon, Idaho"],
    correctAnswer: "New Hampshire, New York, New Jersey",
    explanation: "The original states include NH, MA, RI, CT, NY, NJ, PA, DE, MD, VA, NC, SC, GA.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What happened at the Constitutional Convention?",
    options: ["The Constitution was written", "The Declaration of Independence was signed", "The Civil War ended", "Washington became President"],
    correctAnswer: "The Constitution was written",
    explanation: "At the Constitutional Convention, the Constitution was written (by the Founding Fathers).",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "When was the Constitution written?",
    options: ["1787", "1776", "1791", "1812"],
    correctAnswer: "1787",
    explanation: "The Constitution was written in 1787.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
    options: ["Alexander Hamilton", "George Washington", "Thomas Jefferson", "Abraham Lincoln"],
    correctAnswer: "Alexander Hamilton",
    explanation: "Writers include James Madison, Alexander Hamilton, John Jay, and Publius.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who is the 'Father of Our Country'?",
    options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "Benjamin Franklin"],
    correctAnswer: "George Washington",
    explanation: "George Washington is called the Father of Our Country.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who was the first President?",
    options: ["George Washington", "John Adams", "Thomas Jefferson", "Abraham Lincoln"],
    correctAnswer: "George Washington",
    explanation: "George Washington was the first President.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What territory did the United States buy from France in 1803?",
    options: ["Louisiana", "Alaska", "Texas", "California"],
    correctAnswer: "Louisiana",
    explanation: "The US bought the Louisiana Territory from France in 1803.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Name one war fought by the United States in the 1800s.",
    options: ["Civil War", "World War I", "World War II", "Korean War"],
    correctAnswer: "Civil War",
    explanation: "Wars in the 1800s include the War of 1812, Mexican-American War, Civil War, and Spanish-American War.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who was President during the Civil War?",
    options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "Theodore Roosevelt"],
    correctAnswer: "Abraham Lincoln",
    explanation: "Abraham Lincoln was President during the Civil War.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What did the Emancipation Proclamation do?",
    options: ["Freed the slaves", "Ended the Civil War", "Gave women the right to vote", "Declared independence"],
    correctAnswer: "Freed the slaves",
    explanation: "The Emancipation Proclamation freed the slaves (in the Confederate states).",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who was President during the Great Depression and World War II?",
    options: ["Franklin Roosevelt", "Herbert Hoover", "Harry Truman", "Woodrow Wilson"],
    correctAnswer: "Franklin Roosevelt",
    explanation: "Franklin Roosevelt was President during the Great Depression and World War II.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Who did the United States fight in World War II?",
    options: ["Japan, Germany, and Italy", "Russia, China, and Japan", "England, France, and Germany", "North Korea and Vietnam"],
    correctAnswer: "Japan, Germany, and Italy",
    explanation: "The US fought Japan, Germany, and Italy in WWII.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "Before he was President, Eisenhower was a general. What war was he in?",
    options: ["World War II", "World War I", "Civil War", "Korean War"],
    correctAnswer: "World War II",
    explanation: "Eisenhower was a general in World War II.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "During the Cold War, what was the main concern of the United States?",
    options: ["Communism", "Terrorism", "Climate Change", "The Economy"],
    correctAnswer: "Communism",
    explanation: "During the Cold War, the main concern was Communism.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What movement tried to end racial discrimination?",
    options: ["Civil rights movement", "Prohibition", "Women's suffrage", "Environmental movement"],
    correctAnswer: "Civil rights movement",
    explanation: "The civil rights movement tried to end racial discrimination.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What did Martin Luther King, Jr. do?",
    options: ["Fought for civil rights", "Became President", "Wrote the Constitution", "Ended the Civil War"],
    correctAnswer: "Fought for civil rights",
    explanation: "Martin Luther King, Jr. fought for civil rights and equality for all Americans.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  {
    questionText: "What major event happened on September 11, 2001, in the United States?",
    options: ["Terrorists attacked the United States", "The stock market crashed", "Hurricane Katrina hit", "The US entered a war"],
    correctAnswer: "Terrorists attacked the United States",
    explanation: "Terrorists attacked the United States on September 11, 2001.",
    category: QuizCategory.AMERICAN_HISTORY
  },
  
  // INTEGRATED CIVICS (Geography, Symbols, Holidays)
  {
    questionText: "Name one of the two longest rivers in the United States.",
    options: ["Mississippi River", "Colorado River", "Ohio River", "Rio Grande"],
    correctAnswer: "Mississippi River",
    explanation: "The two longest rivers are the Missouri and Mississippi Rivers.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "What ocean is on the West Coast of the United States?",
    options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
    correctAnswer: "Pacific Ocean",
    explanation: "The Pacific Ocean is on the West Coast.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "What ocean is on the East Coast of the United States?",
    options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
    correctAnswer: "Atlantic Ocean",
    explanation: "The Atlantic Ocean is on the East Coast.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Name one U.S. territory.",
    options: ["Puerto Rico", "Hawaii", "Alaska", "Texas"],
    correctAnswer: "Puerto Rico",
    explanation: "US territories include Puerto Rico, Guam, US Virgin Islands, American Samoa, and Northern Mariana Islands.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Name one state that borders Canada.",
    options: ["New York", "California", "Texas", "Florida"],
    correctAnswer: "New York",
    explanation: "States bordering Canada include Maine, NH, VT, NY, PA, OH, MI, MN, ND, MT, ID, WA, AK.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Name one state that borders Mexico.",
    options: ["California", "New York", "Florida", "Washington"],
    correctAnswer: "California",
    explanation: "States bordering Mexico include CA, AZ, NM, TX.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "What is the capital of the United States?",
    options: ["Washington, D.C.", "New York City", "Philadelphia", "Boston"],
    correctAnswer: "Washington, D.C.",
    explanation: "Washington, D.C. is the capital of the United States.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Where is the Statue of Liberty?",
    options: ["New York Harbor", "Boston Harbor", "San Francisco Bay", "Washington, D.C."],
    correctAnswer: "New York Harbor",
    explanation: "The Statue of Liberty is in New York Harbor (Liberty Island).",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Why does the flag have 13 stripes?",
    options: ["Because there were 13 original colonies", "Because there are 13 commandments", "Because it looks nice", "Because there are 13 founding fathers"],
    correctAnswer: "Because there were 13 original colonies",
    explanation: "The stripes represent the original 13 colonies.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Why does the flag have 50 stars?",
    options: ["Because there is one star for each state", "Because there were 50 presidents", "Because the country is 50 years old", "Because there are 50 senators"],
    correctAnswer: "Because there is one star for each state",
    explanation: "There is one star for each state (50 states total).",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "What is the name of the national anthem?",
    options: ["The Star-Spangled Banner", "America the Beautiful", "God Bless America", "My Country, 'Tis of Thee"],
    correctAnswer: "The Star-Spangled Banner",
    explanation: "The national anthem is The Star-Spangled Banner.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "When do we celebrate Independence Day?",
    options: ["July 4", "January 1", "December 25", "May 1"],
    correctAnswer: "July 4",
    explanation: "We celebrate Independence Day on July 4.",
    category: QuizCategory.INTEGRATED_CIVICS
  },
  {
    questionText: "Name two national U.S. holidays.",
    options: ["New Year's Day and Christmas", "Halloween and Easter", "Valentine's Day and Thanksgiving", "April Fools' Day and Labor Day"],
    correctAnswer: "New Year's Day and Christmas",
    explanation: "National holidays include New Year's, MLK Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas.",
    category: QuizCategory.INTEGRATED_CIVICS
  },

  // CIVIC DUTIES (Technically part of American Government usually, but keeping existing category)
  {
    questionText: "What is one responsibility that is only for United States citizens?",
    options: ["Serve on a jury", "Pay taxes", "Obey the law", "Go to school"],
    correctAnswer: "Serve on a jury",
    explanation: "Responsibilities only for citizens include serving on a jury and voting in a federal election.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "Name one right only for United States citizens.",
    options: ["Vote in a federal election", "Freedom of speech", "Freedom of religion", "Right to bear arms"],
    correctAnswer: "Vote in a federal election",
    explanation: "Rights only for citizens include voting in a federal election and running for federal office.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "What are two rights of everyone living in the United States?",
    options: ["Freedom of speech and freedom of religion", "Freedom to vote and run for office", "Freedom of speech and right to a job", "Freedom of religion and right to healthcare"],
    correctAnswer: "Freedom of speech and freedom of religion",
    explanation: "Rights for everyone include freedom of expression, speech, assembly, petition, and religion.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "What do we show loyalty to when we say the Pledge of Allegiance?",
    options: ["The United States", "The President", "Congress", "The State"],
    correctAnswer: "The United States",
    explanation: "We show loyalty to the United States and the flag.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "What is one promise you make when you become a United States citizen?",
    options: ["Give up loyalty to other countries", "Disobey the laws", "Not pay taxes", "Never travel abroad"],
    correctAnswer: "Give up loyalty to other countries",
    explanation: "Promises include giving up loyalty to other countries, defending the Constitution, and obeying the laws.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "How old do citizens have to be to vote for President?",
    options: ["18 and older", "21 and older", "16 and older", "25 and older"],
    correctAnswer: "18 and older",
    explanation: "Citizens must be 18 and older to vote.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "What are two ways that Americans can participate in their democracy?",
    options: ["Vote and run for office", "Write to a newspaper and ignore laws", "Call Senators and not pay taxes", "Join a party and riot"],
    correctAnswer: "Vote and run for office",
    explanation: "Ways include voting, joining a party, helping a campaign, calling officials, running for office, etc.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "When is the last day you can send in federal income tax forms?",
    options: ["April 15", "January 1", "December 31", "July 4"],
    correctAnswer: "April 15",
    explanation: "The last day to send in federal income tax forms is April 15.",
    category: QuizCategory.CIVIC_DUTIES
  },
  {
    questionText: "When must all men register for the Selective Service?",
    options: ["At age 18", "At age 21", "At age 16", "At age 25"],
    correctAnswer: "At age 18",
    explanation: "Men must register for Selective Service between 18 and 26.",
    category: QuizCategory.CIVIC_DUTIES
  }
];