Here's a simple example of a Python program that loops from 1 to 5 and prints the numbers:

```python
for i in range(1, 6):
    print(i)
```

This will print:

```
1
2
3
4
5
```

Here's a more interactive version that will ask the user for input:

```python
for i in range(1, 6):
    user_input = input(f"Enter a number between 1 and 5: ")
    if user_input.isdigit() and int(user_input) >= 1 and int(user_input) <= 5:
        print(f"You entered: {user_input}")
    else:
        print("Invalid input. Please enter a number between 1 and 5.")
```

This will print:

```
Enter a number between 1 and 5:
Enter a number between 1 and 5: 1
You entered: 1
Enter a number between 1 and 5:
Enter a number between 1 and 5: 6
Invalid input. Please enter a number between 1 and 5.
```

And here's a version that will ask the user to enter a number between 1 and 5 and then display all the numbers in the range:

```python
numbers = []
for i in range(1, 6):
    user_input = input(f"Enter a number between 1 and {i}: ")
    if user_input.isdigit() and int(user_input) >= 1 and int(user_input) <= i:
        numbers.append(int(user_input))
    else:
        print("Invalid input. Please enter a number between 1 and", i)
print("You entered:", numbers)
```

This will print:

```
Enter a number between 1 and 5:
Enter a number between 1 and 5: 1
Enter a number between 1 and 5: 2
Enter a number between 1 and 5: 3
Enter a number between 1 and 5: 4
Enter a number between 1 and 5: 5
You entered: [1, 2, 3, 4, 5]
```
