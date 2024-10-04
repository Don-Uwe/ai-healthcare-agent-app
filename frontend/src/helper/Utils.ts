import NetInfo from '@react-native-community/netinfo';
import {Article, Category, CategoryType, Podcast} from '../type';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkInternetConnection = (
  callback: (isConnected: boolean) => void,
) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    return callback(state.isConnected);
  });

  return unsubscribe;
};

export const Categories: CategoryType[] = [
  {id: 1, name: 'Cardiology'},
  {id: 2, name: 'Neurology'},
  {id: 3, name: 'Oncology'},
  {id: 4, name: 'Dermatology'},
  {id: 5, name: 'Gastroenterology'},
  {id: 6, name: 'Endocrinology'},
  {id: 7, name: 'Pediatrics'},
  {id: 8, name: 'Orthopedics'},
  {id: 9, name: 'Psychiatry'},
  {id: 10, name: 'Pulmonology'},
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'The Silent Killer: Hypertension',
    description:
      'Hypertension, also known as high blood pressure, often shows no symptoms but can lead to serious health complications if untreated.',
    content:
      'Content about hypertension, its causes, symptoms, and treatments...',
    category: ['Popular', 'Stories'],
    author_name: 'Dr. Alex Carter',
    lastUpdatedAt: '14.06.2024',
    imageUtils:
      'https://img.freepik.com/free-vector/tiny-doctor-heart-patient-with-high-blood-pressure-medical-checkup-hospital-clinic-risk-cholesterol-cardiovascular-disease-flat-vector-illustration-cardiology-health-concept_74855-20983.jpg?size=626&ext=jpg&ga=GA1.1.1141335507.1718582400&semt=sph',
  },
  {
    id: '2',
    title: 'Understanding Diabetes: Types, Symptoms, and Management',
    description:
      'Diabetes is a chronic condition characterized by high blood sugar levels. Learn about the different types, symptoms, and management strategies.',
    content: 'Content about diabetes, its types, symptoms, and management...',
    category: ['Health', 'Stories'],
    author_name: 'Dr. Emily White',
    lastUpdatedAt: '13.06.2024',
    imageUtils:
      'https://cdn.pixabay.com/photo/2015/05/21/11/17/diabetes-777002_640.jpg',
  },
  {
    id: '3',
    title: 'Cancer: Early Detection and Treatment Options',
    description:
      'Cancer remains one of the leading causes of death worldwide. Early detection and advanced treatment options can improve survival rates.',
    content:
      'Content about cancer, its early detection, and treatment options...',
    category: ['Diseases', 'Popular'],
    author_name: 'Dr. Michael Johnson',
    lastUpdatedAt: '12.06.2024',
    imageUtils:
      'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/01/GettyImages-122373924_header-1024x575-1.jpg?w=1155&h=1207',
  },
  {
    id: '4',
    title: 'The Impact of Obesity on Overall Health',
    description:
      'Obesity is linked to a range of health issues, including diabetes, heart disease, and joint problems. Learn about the impact of obesity on health.',
    content:
      'Content about obesity, its impact on health, and ways to manage weight...',
    category: ['Popular', 'Stories'],
    author_name: 'Dr. Sarah Lee',
    lastUpdatedAt: '11.06.2024',
    imageUtils:
      'https://www.hindustantimes.com/ht-img/img/2024/05/11/1600x900/obesity-cancer_1715423468999_1715423469283.jpg',
  },
  {
    id: '5',
    title: 'Heart Disease: Prevention and Management',
    description:
      'Heart disease is a leading cause of death worldwide. Discover prevention strategies and management techniques to reduce your risk.',
    content: 'Content about heart disease, its prevention, and management...',
    category: ['Health', 'Diseases'],
    author_name: 'Dr. James Brown',
    lastUpdatedAt: '10.06.2024',
    imageUtils:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiPsTqx0xw0aGEY64kyk7qvW29yz9xN3QWPg&s',
  },
  {
    id: '6',
    title: 'Chronic Respiratory Diseases: Asthma and COPD',
    description:
      'Chronic respiratory diseases, such as asthma and COPD, affect millions of people. Learn about their symptoms and treatments.',
    content:
      'Content about chronic respiratory diseases, their symptoms, and treatments...',
    category: ['Popular', 'Stories'],
    author_name: 'Dr. Anna Wilson',
    lastUpdatedAt: '09.06.2024',
    imageUtils:
      'https://st4.depositphotos.com/6563466/38921/i/450/depositphotos_389216432-stock-photo-human-respiratory-system-lungs-anatomy.jpg',
  },
  {
    id: '7',
    title: 'Alzheimer’s Disease: Understanding the Symptoms and Care',
    description:
      'Alzheimer’s disease is a progressive neurological disorder. Understand its symptoms, stages, and care options.',
    content:
      'Content about Alzheimer’s disease, its symptoms, and care options...',
    category: ['Diseases', 'Stories'],
    author_name: 'Dr. Robert Green',
    lastUpdatedAt: '08.06.2024',
    imageUtils:
      'https://media.istockphoto.com/id/1125868862/photo/3d-illustration-of-the-human-brain-with-alzheimers-disease-dementia.jpg?s=612x612&w=0&k=20&c=FrD3pBhyBOjtgaWw_WDdAh2ktxWoaDm2DW_Ty47R5eg=',
  },
  {
    id: '8',
    title: 'Stroke: Signs, Prevention, and Recovery',
    description:
      'Stroke is a medical emergency that requires immediate attention. Learn about the signs, prevention methods, and recovery processes.',
    content: 'Content about stroke, its signs, prevention, and recovery...',
    category: ['Health', 'Stories'],
    author_name: 'Dr. Laura Davis',
    lastUpdatedAt: '07.06.2024',
    imageUtils:
      'https://www.apexhospitals.com/_next/image?url=https%3A%2F%2Fbed.apexhospitals.com%2Fuploads%2Fstroke_management_6fdf77c521.png&w=1200&q=75',
  },
  {
    id: '9',
    title: 'Mental Health Disorders: Types and Treatments',
    description:
      'Mental health disorders are common and treatable. Discover the different types of disorders and available treatments.',
    content:
      'Content about mental health disorders, their types, and treatments...',
    category: ['Health', 'Popular'],
    author_name: 'Dr. Chris Miller',
    lastUpdatedAt: '06.06.2024',
    imageUtils:
      'https://img.freepik.com/free-vector/gradient-world-mental-health-day-background_23-2149604961.jpg',
  },
  {
    id: '10',
    title: 'Infectious Diseases: Prevention and Vaccination',
    description:
      'Infectious diseases can spread quickly and cause serious health problems. Learn about prevention methods and the importance of vaccination.',
    content:
      'Content about infectious diseases, their prevention, and vaccination...',
    category: ['Health', 'Diseases'],
    author_name: 'Dr. Patricia Taylor',
    lastUpdatedAt: '05.06.2024',
    imageUtils:
      'https://www.shutterstock.com/image-illustration/virus-vaccine-flu-coronavirus-medical-600nw-1667085835.jpg',
  },
];

export const podcast: Podcast[] = [
  {
    title: 'Health Matters',
    host: 'Dr. Jane Smith',
    imageUri:
      'https://i.scdn.co/image/ab6765630000ba8a73f9ca9da7bba329aff8638b',
    likes: 120,
    duration: '30 min',
  },
  {
    title: 'Fitness Talk',
    host: 'John Doe',
    imageUri: 'https://images.radio.com/podcast/be7252f353.jpg',
    likes: 85,
    duration: '25 min',
  },
  {
    title: 'Nutrition Now',
    host: 'Sara Lee',
    imageUri:
      'https://i.dailymail.co.uk/1s/2024/05/22/20/85217355-13448793-image-a-73_1716404901450.jpg',
    likes: 95,
    duration: '20 min',
  },
  {
    title: 'Mental Health Matters',
    host: 'Dr. Emily Stone',
    imageUri:
      'https://i.scdn.co/image/ab67656300005f1fbbecf91e128e1c623513218f',
    likes: 110,
    duration: '40 min',
  },
  {
    title: 'Yoga and You',
    host: 'Michael Brown',
    imageUri:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkCPXlx996u66AstY4SUxM6wRgpGdnthccQQ&s',
    likes: 75,
    duration: '35 min',
  },
  {
    title: 'Wellness Warriors',
    host: 'David Clark',
    imageUri:
      'https://cdn-images-3.listennotes.com/podcasts/wellness-warriors-by-felicity-cohen-R7auJhlLnUP-NMsP3zcgunv.1400x1400.jpg',
    likes: 90,
    duration: '50 min',
  },
  {
    title: 'Healthy Habits',
    host: 'Lisa Martin',
    imageUri:
      'https://cdn-images-3.listennotes.com/podcasts/healthy-habits-podcast-with-dr-anderson-dr-SsF6J-4xMBp.600x600.jpg',
    likes: 105,
    duration: '45 min',
  },
  {
    title: 'Fitness Freak',
    host: 'Chris Johnson',
    imageUri:
      'https://i1.sndcdn.com/avatars-YoBEGihqs9XQi12g-j10CEA-t1080x1080.jpg',
    likes: 60,
    duration: '30 min',
  },
  {
    title: 'Holistic Health',
    host: 'Natalie Green',
    imageUri:
      'https://i.scdn.co/image/ab6765630000ba8aa02b19cb8acadc824c29b395',
    likes: 130,
    duration: '55 min',
  },
  {
    title: 'Mindful Living',
    host: 'Paul White',
    imageUri: 'https://assets.libsyn.com/content/164282173',
    likes: 115,
    duration: '20 min',
  },
];

// Async Storage for get Item
export const retrieveItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
    console.log('Error reading value', e);
  }
};

// Async Storage Store Item
export const storeItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Value saved for key : ${key}`, value);
  } catch (e) {
    // saving error
    console.log('Async Storage Data error', e);
  }
};

// Async storage remove item

export const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const demo: string = `<h1 id="alzheimer-s-disease-understanding-symptoms-and-care">Alzheimer&#39;s Disease: Understanding Symptoms and Care</h1>
<h2 id="introduction">Introduction</h2>
<p>Alzheimer&#39;s is one kind of progressive neurologic disorder which mainly contributes to problems in memory, thinking, and behavior. It accounts for 60-80% of all cases of dementia in elderly people, making it one of the most common kinds of dementia among the elderly. The disease is named after Dr. Alois Alzheimer, who first described it in 1906 following the post-mortem analysis of changes in the brain tissue of a woman who died from an unusual mental illness.</p>
<p>It&#39;s a disorder characterized by the deposition of amyloid plaques and neurofibrillary tangles in the brain and, eventually, killing the brain cells. This will finally lead to progressive loss of cognitive functions, where patients have a hard time performing daily activities. The symptoms and strategies for care should be learnt in order to understand how to deal with the disease and care for your loved one.</p>
<p><img src="https://vajiram-prod.s3.ap-south-1.amazonaws.com/What_is_Alzheimer_s_Disease_fa85f9b7f5.jpg" alt="Alzheimer's Disease" style="width:100%; height:400px; object-fit:contain;"/></p>
<h2 id="symptoms-of-alzheimer-s-disease">Symptoms of Alzheimer&#39;s Disease</h2>
<h3 id="early-symptoms">Early Symptoms</h3>
<p>1) #### Significant Memory Loss</p>
<p>Forgetting one&#39;s personal history, important dates, and recent experiences. During the beginning of memory loss, changes can be very subtle. It involves repetitive questioning for the same information, increasingly relying on memory aids, or simply forgetting important dates, appointments, and events.</p>
<p>2) #### Difficulty Planning and Solving Problems
Difficulty following plans, working with numbers, and solving familiar problems—difficulty following a familiar recipe, keeping track of monthly bills, concentration, and doing things that take much longer than usual.</p>
<p>3) #### Confusion with Time or Place
Loss of track of dates, seasons, time passage. An individual with Alzheimer&#39;s will forget where they are or how they got there. In addition, such people forget things that are not immediately happening and become disoriented about their place or surroundings than before.</p>
<p>4) #### Trouble Understanding Visual Images and Spatial Relationships
It can make reading quite difficult, estimation of distances—a problem in driving—and judging colour or contrast, which may also contribute to the number of falls or accidents. It may be hard to recognize faces or common objects.</p>
<p>5) #### New Problems with Words in Speaking or Writing
Difficulty in vocabulary, searching for the right word, or following or joining in a conversation. This can include such past behaviors as breaking off in mid-conversation and not knowing how to continue. Others include repetition and difficulty naming objects or people.</p>
<p>6) #### Misplacing Things and Losing the Ability to Retrace Steps
Putting things in inappropriate places and then being unable to find them. The patient tends to accuse others of concealing things or even stealing their items. This becomes increasingly common and frustrating, increasing anxiety.</p>
<p>7) #### Decreased or Poor Judgment
Making bad decisions, for instance, to give telemarketers massive amounts of money. One may become increasingly indifferent to their own looks or hygiene. They also show poor judgment with money and in social situations.</p>
<p>8) #### Withdrawal from Work or Social Activities
This can lead to situations of social withdrawal and result in isolation and depression when there is embarrassment in situations of a social nature, whether it is a hobby or work project, because of the difficulty of keeping up on the conversation or activity.</p>
<p>9) #### Changes in Mood and Personality
Mood swings, confusion, suspiciousness, depression, fear, anxiety. Easily upset at home, with friends, or in places where they are out of their comfort zone. Personality changes can be especially disturbing for the patient and their families.</p>
<p><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqiSf10LbouQkrT0GY2IVNwIgJQIqPXHz-vQ&s" alt="Memory Loss" style="width:100%; height:600px; object-fit:contain;"/></p>
<h3 id="moderate-symptoms">Moderate Symptoms</h3>
<p>As Alzheimer&#39;s disease progresses, symptoms become more pronounced and can include:</p>
<p>1) #### Increased Memory Loss and Confusion</p>
<p>The memory loss worsens, and a person suffering from this disease is not able to recognize his family members, friends, etc. They may forget important personal information, such as the address or telephone number.</p>
<p>2) #### Difficulty with Language and Communication
Increasing language difficulties, including use of vocabulary, fluency, and the ability to make sense in constructing sentences. They may also have trouble understanding spoken or written language.</p>
<p>3) #### Behavioral and Psychological Symptoms
This can include agitation, aggression, hallucinations, delusions, and other symptoms that can be very upsetting and very difficult to control.</p>
<p>4) #### Physical Coordination and Movement
A decrease in physical abilities, trouble with coordination, and fine motor skills. This can lead to difficulty with walking, maintaining balance, and increased risk of falls.</p>
<p>5) #### Changes in Sleep Patterns
Changes in sleep patterns; insomnia, somnolence, and restlessness at night. This may not only disturb the patient&#39;s sleep but also affect the family caregivers&#39;.</p>
<p>6) #### Increased Dependence on Caregivers
Increased dependency on their caregivers for bathing, dressing, eating, and self-care toiletting. Caregivers may be required to watch the patients constantly to ensure that they are protected from injury.</p>
<h3 id="severe-symptoms">Severe Symptoms</h3>
<p>In the advanced stage, the Alzheimer&#39;s patient becomes bedridden and is unable to respond to their surroundings, communicate, or perform basic activities. The symptoms include:</p>
<p>1) #### Severe Memory Loss
Inability to recognize close relations or friends. They develop a profound loss of memory, and even the identity of self is not recallable.</p>
<p>2) #### Inability to Communicate Verbally</p>
<p>Inability to speak or understand language; the patient is only able to groan, moan, or make other sounds.</p>
<p>3) #### Difficulty Swallowing and Eating</p>
<p>Difficulty swallowing, leading to weight loss, dehydration, and malnutrition. It could also result in a higher than usual risk of aspiration pneumonia.</p>
<p>4) #### Loss of Bladder and Bowel Control
Incontinence is common, and the individual often requires full-time care, needing assistance with toileting.</p>
<p>5) #### Increased Risk of Infections
Decreased resistance and loss of mobility increase the risk of infections, such as pneumonia and urinary tract infections.</p>
<p>6) #### Total Dependence on Caregivers
Advanced Stage: Total dependence of the person on the caregiver for all personal care needs; round-the-clock care and supervision are required for people in this stage.</p>
<p><img src="https://villagegreenalzheimerscare.com/wp-content/uploads/2021/11/Capture-7-stages.jpg" alt="Stages of Alzheimer's Disease" style="width:100%; height:400px; object-fit:contain;"/></p>
<h2 id="diagnosis-of-alzheimer-s-disease">Diagnosis of Alzheimer&#39;s Disease</h2>
<h3 id="medical-history-and-physical-examination">Medical History and Physical Examination</h3>
<p>The diagnosis of Alzheimer&#39;s disease incorporates an entire medical history and physical examination. A doctor will ask about symptoms, family history, and other medical conditions. He may also conduct some tests that would help determine memory, problem-solving abilities, attention counting, and language.</p>
<h3 id="neuropsychological-testing">Neuropsychological Testing</h3>
<p>Neuropsychological tests portray an assessment of detailed cognitive functions, including memory, language, attention, and problem-solving. All these tests help in identifying specific areas where there is a deficit in cognitive functions and make a differential diagnosis for Alzheimer&#39;s disease from other dementia syndromes.</p>
<h3 id="brain-imaging">Brain Imaging</h3>
<p>Methods for imaging, such as magnetic resonance imaging (MRI) and computed tomography (CT) scans, have been used to determine changes in brain structure. Imaging in this research might show brain atrophy, which is the process of the brain getting smaller, and may rule out other factors that might show similar symptoms, such as brain tumors or strokes.</p>
<h3 id="biomarker-testing">Biomarker Testing</h3>
<p>Biomarker tests measure the cerebrospinal fluid or blood for specific proteins related to Alzheimer&#39;s disease, such as amyloid-beta and tau. This can help confirm a diagnosis and chart the progress of the disease.</p>
<h3 id="genetic-testing">Genetic Testing</h3>
<p>Genetic testing can detect some genes responsible for Alzheimer&#39;s disease—for example, APOE-e4—but their presence does not mean that the bearer will acquire the illness; it serves to increase the risk.</p>
<h3 id="differential-diagnosis">Differential Diagnosis</h3>
<p>Differential diagnosis rules out all the other diseases that may have a similar way of manifestation and presentation of symptoms, such as other dementias, depression, or vitamin deficiencies. It helps in giving an appropriate diagnosis for Alzheimer&#39;s disease and administering proper treatment and care.</p>
<p><img src="https://www.itnonline.com/sites/default/files/AlzheimersBrain.jpg" alt="Brain Imaging" style="width:100%; height:400px; object-fit:contain;"/></p>
<h2 id="stages-of-alzheimer-s-disease">Stages of Alzheimer&#39;s Disease</h2>
<h3 id="mild-alzheimer-s-disease-early-stage-">Mild Alzheimer&#39;s Disease (Early Stage)</h3>
<p>In the early stage of Alzheimer&#39;s disease, individuals may still function independently but start to experience memory lapses and other cognitive difficulties. Common symptoms include:</p>
<ul>
<li>Difficulty remembering recent events and new information</li>
<li>Trouble organizing and planning</li>
<li>Difficulty performing complex tasks</li>
<li>Changes in mood and personality</li>
</ul>
<h3 id="moderate-alzheimer-s-disease-middle-stage-">Moderate Alzheimer&#39;s Disease (Middle Stage)</h3>
<p>As the disease progresses to the middle stage, individuals may require more assistance with daily activities. Symptoms become more pronounced and may include:</p>
<ul>
<li>Increased memory loss and confusion</li>
<li>Difficulty recognizing family and friends</li>
<li>Trouble learning new things</li>
<li>Problems with language and communication</li>
<li>Difficulty performing tasks that involve multiple steps, such as dressing</li>
<li>Changes in sleep patterns</li>
<li>Wandering and getting lost</li>
<li>Increased risk of falls</li>
</ul>
<h3 id="severe-alzheimer-s-disease-late-stage-">Severe Alzheimer&#39;s Disease (Late Stage)</h3>
<p>In the late stage of Alzheimer&#39;s disease, individuals lose the ability to respond to their environment, communicate, and perform basic activities of daily living. Symptoms may include:</p>
<ul>
<li>Severe memory loss</li>
<li>Inability to communicate verbally</li>
<li>Difficulty swallowing and eating</li>
<li>Loss of bladder and bowel control</li>
<li>Increased risk of infections, such as pneumonia</li>
<li>Total dependence on caregivers for personal care</li>
</ul>
<p><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpl3SW0qHutCImVEI0sn6ptZ_SegQ0KFXjNg&s" alt="Stages of Alzheimer's Disease" style="width:100%; height:400px; object-fit:contain;"/></p>
<h2 id="caring-for-someone-with-alzheimer-s-disease">Caring for Someone with Alzheimer&#39;s Disease</h2>
<h3 id="creating-a-safe-environment">Creating a Safe Environment</h3>
<p>Ensuring a safe living environment is crucial for individuals with Alzheimer&#39;s disease. This includes:</p>
<ul>
<li>Removing tripping hazards, such as rugs and clutter</li>
<li>Installing handrails and grab bars in bathrooms and along staircases</li>
<li>Using locks on cabinets containing potentially dangerous items</li>
<li>Installing door alarms or motion sensors to prevent wandering</li>
<li>Keeping the home well-lit to avoid confusion and accidents</li>
<li>Securing all exits to prevent wandering outside unsupervised</li>
</ul>
<h3 id="providing-physical-and-emotional-support">Providing Physical and Emotional Support</h3>
<p>Caregivers play a vital role in providing both physical and emotional support. This involves:</p>
<ul>
<li>Assisting with daily activities, such as bathing, dressing, eating, and toileting</li>
<li>Encouraging physical activity to maintain mobility and overall health</li>
<li>Offering emotional support and companionship</li>
<li>Using a calm and reassuring tone when communicating</li>
<li>Being patient and flexible, as individuals may have good and bad days</li>
<li>Understanding the emotional challenges the individual may face and providing a comforting presence</li>
</ul>
<h3 id="managing-behavioral-changes">Managing Behavioral Changes</h3>
<p>Behavioral changes are common in individuals with Alzheimer&#39;s disease. Caregivers can manage these changes by:</p>
<ul>
<li>Identifying triggers for behavioral changes and avoiding them when possible</li>
<li>Using distraction and redirection techniques</li>
<li>Establishing a consistent daily routine</li>
<li>Offering reassurance and comfort during periods of agitation or confusion</li>
<li>Seeking advice from healthcare professionals for managing severe behavioral issues</li>
</ul>
<p><img src="https://www.helpguide.org/wp-content/uploads/2023/02/Alzheimers-Care-Help-for-Caregivers.jpeg" alt="Caregiver Support" style="width:100%; height:400px; object-fit:contain;"/></p>
<h3 id="encouraging-cognitive-and-social-engagement">Encouraging Cognitive and Social Engagement</h3>
<p>Engaging in cognitive and social activities can help individuals with Alzheimer&#39;s disease maintain their mental function and emotional well-being. Activities may include:</p>
<ul>
<li>Playing memory games and puzzles</li>
<li>Reading books or listening to audiobooks</li>
<li>Participating in arts and crafts</li>
<li>Listening to music or playing musical instruments</li>
<li>Spending time with family and friends</li>
<li>Attending support groups or community events</li>
</ul>
<h3 id="seeking-professional-help-and-support">Seeking Professional Help and Support</h3>
<p>Caring for someone with Alzheimer&#39;s disease can be challenging, and seeking professional help is essential. Caregivers should consider:</p>
<ul>
<li>Consulting with healthcare professionals for medical advice and treatment options</li>
<li>Joining support groups for caregivers to share experiences and receive emotional support</li>
<li>Utilizing respite care services to take breaks and prevent caregiver burnout</li>
<li>Exploring home health care or assisted living options if the individual&#39;s needs exceed the caregiver&#39;s capacity</li>
</ul>
<p><img src="https://www.alzheimers.org.uk/sites/default/files/inline-images/dsw.jpg" alt="Support Group" style="width:100%; height:400px; object-fit:contain;"/></p>
<h2 id="treatment-and-management-of-alzheimer-s-disease">Treatment and Management of Alzheimer&#39;s Disease</h2>
<h3 id="medications">Medications</h3>
<p>Currently, there is no cure for Alzheimer&#39;s disease, but several medications can help manage symptoms and improve quality of life. These include:</p>
<ul>
<li><strong>Cholinesterase Inhibitors</strong>: Medications such as donepezil, rivastigmine, and galantamine can help improve cognitive function and delay the progression of symptoms.</li>
<li><strong>Memantine</strong>: This medication helps regulate the activity of glutamate, a neurotransmitter involved in learning and memory.</li>
<li><strong>Antidepressants</strong>: These can help manage depression, anxiety, and other mood disorders that may accompany Alzheimer&#39;s disease.</li>
<li><strong>Antipsychotics</strong>: Used cautiously to manage severe behavioral symptoms such as aggression or hallucinations.</li>
</ul>
<h3 id="non-pharmacological-treatments">Non-Pharmacological Treatments</h3>
<p>Non-drug approaches can also play a significant role in managing Alzheimer&#39;s disease:</p>
<ul>
<li><strong>Cognitive Stimulation Therapy (CST)</strong>: Involves engaging activities designed to stimulate thinking and memory.</li>
<li><strong>Behavioral Therapy</strong>: Techniques to manage behavioral symptoms and improve communication.</li>
<li><strong>Occupational Therapy</strong>: Helps individuals maintain their independence and perform daily activities safely.</li>
<li><strong>Physical Therapy</strong>: Encourages physical activity to maintain mobility and overall health.</li>
</ul>
<h3 id="lifestyle-and-home-remedies">Lifestyle and Home Remedies</h3>
<p>Certain lifestyle changes can help manage symptoms and improve quality of life:</p>
<ul>
<li><strong>Healthy Diet</strong>: A balanced diet rich in fruits, vegetables, whole grains, and lean proteins can support overall health.</li>
<li><strong>Regular Exercise</strong>: Physical activity can improve mood, cardiovascular health, and overall well-being.</li>
<li><strong>Social Engagement</strong>: Maintaining social connections can help reduce feelings of isolation and improve mental health.</li>
<li><strong>Mental Stimulation</strong>: Engaging in activities that challenge the brain, such as puzzles, reading, and learning new skills.</li>
</ul>
<h3 id="future-directions-in-alzheimer-s-research">Future Directions in Alzheimer&#39;s Research</h3>
<p>Research on Alzheimer&#39;s disease is ongoing, and new discoveries continue to provide hope for better treatments and a potential cure. Some promising areas of research include:</p>
<ul>
<li><strong>Amyloid and Tau Therapies</strong>: Investigating drugs that target amyloid plaques and tau tangles in the brain.</li>
<li><strong>Immunotherapy</strong>: Developing vaccines and antibodies to help the immune system fight Alzheimer&#39;s-related brain changes.</li>
<li><strong>Gene Therapy</strong>: Exploring ways to modify genes associated with Alzheimer&#39;s to prevent or slow the disease.</li>
<li><strong>Lifestyle Interventions</strong>: Studying the impact of diet, exercise, and other lifestyle factors on the development and progression of Alzheimer&#39;s disease.</li>
</ul>
<h2 id="support-for-caregivers">Support for Caregivers</h2>
<h3 id="emotional-support">Emotional Support</h3>
<p>Caregiving for someone with Alzheimer&#39;s can be emotionally taxing. It&#39;s essential for caregivers to:</p>
<ul>
<li>Seek support from friends, family, and support groups.</li>
<li>Take breaks and practice self-care to prevent burnout.</li>
<li>Share their experiences and feelings with others who understand their challenges.</li>
</ul>
<h3 id="practical-support">Practical Support</h3>
<p>Caregivers can benefit from practical support and resources, such as:</p>
<ul>
<li><strong>Respite Care</strong>: Temporary relief services that provide caregivers with a break.</li>
<li><strong>Adult Day Care Centers</strong>: Offer social and recreational activities for individuals with Alzheimer&#39;s.</li>
<li><strong>In-Home Care Services</strong>: Professional caregivers who can assist with daily activities.</li>
<li><strong>Financial and Legal Resources</strong>: Guidance on managing finances and legal matters related to caregiving.</li>
</ul>
<p><img src="https://assets.clevelandclinic.org/transform/c1fe0bbd-2fc1-487f-a593-67c87e650a0a/Alzheimers-Care-1251255757-967x544-1_jpg" alt="Caregiver Relief" style="width:100%; height:400px; object-fit:contain;"/></p>
<h3 id="education-and-training">Education and Training</h3>
<p>Caregivers should seek education and training on Alzheimer&#39;s disease and caregiving techniques:</p>
<ul>
<li><strong>Workshops and Seminars</strong>: Many organizations offer training sessions for caregivers.</li>
<li><strong>Online Resources</strong>: Websites and online courses provide valuable information and tips.</li>
<li><strong>Books and Guides</strong>: Comprehensive resources that cover various aspects of Alzheimer&#39;s care.</li>
</ul>
<h2 id="community-and-societal-impact">Community and Societal Impact</h2>
<h3 id="raising-awareness">Raising Awareness</h3>
<p>Raising awareness about Alzheimer&#39;s disease is crucial for fostering understanding and support. This can be achieved through:</p>
<ul>
<li><strong>Public Campaigns</strong>: Initiatives to educate the public about Alzheimer&#39;s disease and its impact.</li>
<li><strong>Advocacy</strong>: Promoting policies and funding for Alzheimer&#39;s research and support services.</li>
<li><strong>Events and Fundraisers</strong>: Organizing events to raise funds and awareness for Alzheimer&#39;s causes.</li>
</ul>
<h3 id="supporting-research">Supporting Research</h3>
<p>Supporting research efforts is essential for finding better treatments and a cure. This can be done by:</p>
<ul>
<li><strong>Participating in Clinical Trials</strong>: Volunteering for research studies to help advance scientific knowledge.</li>
<li><strong>Donating to Research Organizations</strong>: Providing financial support to organizations dedicated to Alzheimer&#39;s research.</li>
<li><strong>Promoting Research Funding</strong>: Advocating for increased funding for Alzheimer&#39;s research at the governmental and institutional levels.</li>
</ul>
<h3 id="building-supportive-communities">Building Supportive Communities</h3>
<p>Creating supportive communities for individuals with Alzheimer&#39;s and their caregivers involves:</p>
<ul>
<li><strong>Dementia-Friendly Initiatives</strong>: Programs that make communities more accessible and supportive for those with dementia.</li>
<li><strong>Support Networks</strong>: Establishing local support groups and services for caregivers and individuals with Alzheimer&#39;s.</li>
<li><strong>Educational Programs</strong>: Offering training and resources for community members to understand and support those affected by Alzheimer&#39;s.</li>
</ul>
<h2 id="conclusion">Conclusion</h2>
<p>Alzheimer&#39;s disease is a complex and progressive condition that significantly impacts individuals and their families. Understanding the symptoms, stages, and care strategies is essential for managing the disease and providing support to those affected. While there is currently no cure for Alzheimer&#39;s disease, early diagnosis and appropriate care can improve the quality of life for individuals and their caregivers. Ongoing research and advancements in medical science offer hope for better treatments and, ultimately, a cure for Alzheimer&#39;s disease in the future.</p>
<p><img src="https://neurosciencenews.com/files/2023/07/donanemab-alzheimers-neuroscience.jpg" alt="Hope" style="width:100%; height:400px; object-fit:contain;"/></p>
<hr>
<p><strong>References:</strong></p>
<ul>
<li>Alzheimer&#39;s Association. (2023). Understanding Alzheimer&#39;s and Dementia.</li>
<li>National Institute on Aging. (2023). Alzheimer&#39;s Disease Fact Sheet.</li>
<li>Mayo Clinic. (2023). Alzheimer&#39;s Disease.</li>
<li>Alzheimer&#39;s Society. (2023). Symptoms and Diagnosis of Alzheimer&#39;s Disease.</li>
</ul>
<hr>
<p> Contributed By <a href="https://github.com/nishant0708"> Nishant Kaushal</a></p>
`;

export const KEYS = {
  USER_ID: 'USER_ID',
  USER_TOKEN: 'USER_TOKEN',
  USER_TOKEN_EXPIRY_DATE: 'USER_TOKEN_EXPIRY_DATE',
};

export const createHTMLStructure = (
  title: string,
  body: string,
  tags: Category[],
  social_link: string,
  author: string,
) => {
  return `<!DOCTYPE html>
<html>
<head>

<title>${title}</title>
<style>
/**
 * Copyright 2024,UltimateHealth. All rights reserved.
 */
body {
  font-family: Arial, sans-serif;
  font-size: 40px; 
  line-height: 1.5; 
  color: #333; 
}

h1 {
  color: #00698f;
}

h2 {
  color: #008000;
}

h3 {
  color: #660066;
}

h4 {
  color: #0099CC;
}

h5 {
  color: #FF9900;
}

h6 {
  color: #663300;
}

ul {
  list-style-type: disc;
}

li {
  margin-bottom: 10px;
}

article {
  width: 80%;
  margin: 40px auto;
}
table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f0f0f0;
  }
.tag-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.tag-list li {
  margin-right: 10px;
}

.tag {
  color: blue;
  text-decoration: none;
}
</style>
</head>
<body>
${body}
<hr>
<ul class="tag-list">
  ${tags
    .map(tag => `<li><a class="tag" href="#">#${tag.name}</a></li>`)
    .join('')}
</ul>
<h3>Author</h3>
<h4>${author}</a></h4>
</body>
`;
};
