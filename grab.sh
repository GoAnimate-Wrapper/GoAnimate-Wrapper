#!/bin/bash
start=$1;end=$2;
offset=${3:-$end};

for (( i = 0; i <= end - start; i++ ))
do
	curl "http://goanimate-wrapper.eu-4.evennode.com/movies/m-$((i + start))" -o "_SAVED/movie-$(echo 000000$((i + offset)) | tail -c 8).xml" -s;
	curl "http://goanimate-wrapper.eu-4.evennode.com/movie_thumbs/m-$((i + start))" -o "_SAVED/thumb-$(echo 000000$((i + offset)) | tail -c 8).png" -s;
	echo $((i + offset));
done