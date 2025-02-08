---
date: 2025-02-08
author: Charles Chen
description: Interview processes have become increasingly long and convoluted.  Is it possible to short circuit the extraneous effort and condense the process without sacrificing on selection for quality and talent?
ogImage: /images/candidate-fail.png
---

# Buy the Pecans; Skip the Trail Mix

[{{ $doc.author }}]{.post-author} - [{{ $doc.date }}]{.post-date}

[{{ $doc.description }}]{.post-desc}

If you turn off your ad blocker and browse the modern web, you might be surprised by the amount of extra cruft you have to wade through before you can get to the actual content that you're interested in.

Even with ad blockers on, sites that feature recipes (for example) often stuff the recipe page with paragraphs of exposition for the purpose of SEO ranking.  What we really care for is the actual, useful content -- just give me the recipe!

There's not much we can do about those recipe sites, but if you find yourself favoring the pecans in your bag of trail mix, *you might consider just buying a bag of pecans* rather than picking around the rest of the trail mix.

---

Technical interviews have become like recipe sites, often bloated with extraneous effort for all parties involved.

Consider the take home project which can take anywhere from a few hours of effort to even a few days!

- The candidate must decide if it's worth their time and effort to spend 2-4+ hours working on a take home project.  Strong candidates with multiple options may choose to simply skip one that requires them to commit extra time. (Kudos to the teams that are thoughtful enough to compensate candidates for their time)
- Once submitted, the hiring team must then go back and review a relatively large body of code and pore over it.
- Because candidates might have used AI or asked someone for help, now another live session has to be scheduled to do a hands-on session to ascertain whether the candidate understands the code.

End-to-end, this process can span over a week!

In the end, for the reviewer, there are clearly only a few key points in the submission that receive more scrutiny and provide the key insights.  Data access code is typically one of the key areas of focus for a backend system as would be API input validation and exception handling.  The rest of the scaffolding to implement a functioning project?  It's largely chaff like the exposition in the recipe and the peanuts in the trail mix; filler added to bulk the mix (well, unless you like the peanuts!).

Would it not be much more efficient to simply focus on the key points that matter and skip the rest?

::quasar-image{src="/images/candidate-fail.png" max-height="500"}
Overly drawn out and complex processes can be a self-inflicted fail.
::

---

It is endlessly fascinating that in an industry so focused on efficiency and removing extraneous effort from processes, that tech interviews have seemingly gone the other way and have instead continued to increase in complexity and friction.  Much like the trend of defaulting to microservices, it is seemingly a self-inflicted wound.

Long, complex processes mean that teams may lose otherwise strong candidates to attrition as the process draws out.  Many good candidates will skip the opportunity entirely due to lack of time to commit to a long take home or process.  Exercises like a take home also require more effort on behalf of the hiring team to review the submission -- a self inflicted wound indeed!

A simple solution to this is to just change the process to focus on those key insights that matter.  When reviewing a take home submission for a backend API, what would really signal a strong candidate?  If you have a concrete answer in mind to this question, then it seems like many hours -- even whole followup sessions -- could be shaved from the process by directly focusing on eliciting that response from the candidate.  If you do not have a concrete answer to this question, then perhaps there is a bigger problem as it may indicate that there is a lack of clarity on what separates a strong candidate submission from simply a working one.

---

As a concrete example, when I interview candidates for C#, I have a set of go-to questions that I have found strongly correlate with a candidate's experience and level of expertise.  One such series of questions focuses on C# generics and `Func` and `Action` delegates.

1. Describe what `Func<T1, T2>` and `Action<T>` are in C#?
2. Given a function that takes a `Func<T1, T2>` or `Action<T>`, invoke it.
3. Write a trivial function that takes a `Func<T1, T2>` or `Action<T>`.

The objective is to see if the candidate understands generics and function delegates; there's no need to have a convoluted process around this since this exercise can be fulfilled in < 5 minutes.

Likewise, another topic of interest is concurrency and similarly, we can have a simple series of questions which directly seeks to surface the candidate's experience and knowledge of concurrency.

1. What does `Task<T>` represent?
2. Write a trivial function that returns a `Task<T>`
3. Write a trivial function that takes a `Func<T1, Task<T2>>`
4. Write a block of code that invokes the function 10 times concurrently and print a message when all 10 executions complete.

These simple exercises can be done together in under 10 minutes, skipping several hours of time investment by both the candidate and the interviewer without losing key technical insights into the candidate's level of experience for a given language or platform.

What about more abstract qualities of the code?  It is similarly possible to design smaller, tighter exercises that focus on measuring for the desired positive signal instead of requiring the extra scaffolding.  For example, if extensibility is a key point of interest, simply design a small, self encapsulated exercise that would produce the target response that would be of interest in a larger project and do that smaller exercise instead.

---

If you find yourself favoring the pecans in your trail mix, *it seems like you might prefer just buying a bag of pecans*.  Similarly, if you find that there are a few key patterns, concepts, or techniques that generate a strong positive signal in a take home or leetcode exercise, consider designing an alternative assessment that seeks to directly elicit and measure for this output.

Using a targeted approach can help reduce the time commitment for both sides without sacrificing signal resolution while also reducing candidate attrition in long, drawn out interview processes.
